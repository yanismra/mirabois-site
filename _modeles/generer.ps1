# Genere les pages savoir-faire du site a partir du modele et des fichiers de _modeles/pages.
# Utilisation (depuis n'importe ou) :  powershell -ExecutionPolicy Bypass -File _modeles\generer.ps1
# Le dossier _modeles n'est pas publie par GitHub Pages (les dossiers commencant par _ sont ignores).
$ErrorActionPreference = 'Stop'
$ici = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Split-Path -Parent $ici
$utf8 = New-Object Text.UTF8Encoding($false)
function Enc([string]$s) { $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;') }

$pages = foreach ($f in Get-ChildItem (Join-Path $ici 'pages') -Filter *.txt) {
  $lignes = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8) -split "`r?`n"
  $p = @{ faq = New-Object System.Collections.ArrayList }
  $zone = 'meta'; $contenu = New-Object System.Collections.ArrayList; $q = $null
  foreach ($l in $lignes) {
    if ($l -eq '=== contenu') { $zone = 'contenu'; continue }
    if ($l -eq '=== faq') { $zone = 'faq'; continue }
    if ($zone -eq 'meta' -and $l -match '^@(\w+)\s+(.*)$') { $p[$Matches[1]] = $Matches[2].Trim() }
    elseif ($zone -eq 'contenu') { [void]$contenu.Add($l) }
    elseif ($zone -eq 'faq' -and $l.Trim()) {
      if ($l.StartsWith('? ')) { $q = $l.Substring(2).Trim() }
      elseif ($q) { [void]$p.faq.Add(@{ q = $q; r = $l.Trim() }); $q = $null }
    }
  }
  $p.contenu = ($contenu -join "`n").TrimEnd()
  [pscustomobject]$p
}
$pages = $pages | Sort-Object { [int]$_.ordre }
$modele = [IO.File]::ReadAllText((Join-Path $ici 'page-savoir-faire.html'), [Text.Encoding]::UTF8)

foreach ($p in $pages) {
  $hero = $p.hero -split '\|'
  $faqHtml = ($p.faq | ForEach-Object { "        <details><summary>$(Enc $_.q)</summary><p>$(Enc $_.r)</p></details>" }) -join "`n"
  $autres = ($pages | Where-Object { $_.slug -ne $p.slug } | ForEach-Object {
    "        <a href=""$($_.slug).html""><img src=""assets/img/$($_.vignette)"" alt="""" loading=""lazy""><span>$(Enc $_.nom)</span></a>" }) -join "`n"
  $liens = ($pages | ForEach-Object {
    if ($_.slug -eq $p.slug) { "        <li><a href=""$($_.slug).html"" aria-current=""page"">$(Enc $_.nom)</a></li>" }
    else { "        <li><a href=""$($_.slug).html"">$(Enc $_.nom)</a></li>" } }) -join "`n"
  $url = "https://mirabois.fr/$($p.slug).html"
  $graphe = @(
    [ordered]@{ '@type' = 'BreadcrumbList'; itemListElement = @(
      [ordered]@{ '@type' = 'ListItem'; position = 1; name = 'Accueil'; item = 'https://mirabois.fr/' },
      [ordered]@{ '@type' = 'ListItem'; position = 2; name = $p.nom; item = $url }) },
    [ordered]@{ '@type' = 'Service'; name = $p.nom; serviceType = $p.nom; url = $url; description = $p.description
      areaServed = @('Yvelines', "Val-d'Oise", 'Paris')
      provider = [ordered]@{ '@type' = 'HomeAndConstructionBusiness'; name = 'Mirabois Construction'; url = 'https://mirabois.fr/'; telephone = '+33651917861' } },
    [ordered]@{ '@type' = 'FAQPage'; mainEntity = @($p.faq | ForEach-Object {
      [ordered]@{ '@type' = 'Question'; name = $_.q; acceptedAnswer = [ordered]@{ '@type' = 'Answer'; text = $_.r } } }) }
  )
  $jsonld = ([ordered]@{ '@context' = 'https://schema.org'; '@graph' = $graphe } | ConvertTo-Json -Depth 8)
  $html = $modele
  $remplacements = [ordered]@{
    '{{titre}}' = Enc $p.titre; '{{description}}' = Enc $p.description; '{{slug}}' = $p.slug
    '{{nom}}' = Enc $p.nom; '{{h1a}}' = Enc $p.h1a; '{{h1b}}' = Enc $p.h1b
    '{{hero_src}}' = $hero[0]; '{{hero_w}}' = $hero[1]; '{{hero_h}}' = $hero[2]; '{{hero_alt}}' = Enc $hero[3]; '{{hero_pos}}' = $hero[4]
    '{{bois_intro}}' = Enc $p.bois_intro; '{{faq_html}}' = $faqHtml; '{{autres}}' = $autres; '{{pied_liens}}' = $liens
    '{{jsonld}}' = $jsonld; '{{contenu}}' = $p.contenu
  }
  foreach ($k in $remplacements.Keys) { $html = $html.Replace($k, [string]$remplacements[$k]) }
  if ($html -match '\{\{\w+\}\}') { throw "Champ non rempli dans $($p.slug) : $($Matches[0])" }
  [IO.File]::WriteAllText((Join-Path $site "$($p.slug).html"), $html, $utf8)
  "ecrit : $($p.slug).html"
}
