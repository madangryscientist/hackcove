#!/usr/bin/env bash
# One sheet per theme: Storybook | Expo web | Android, page a above page b, each column 1080 wide.
set -euo pipefail
cd "$TMPDIR/hc192"
A="actions-button--variants actions-button--sizes actions-button--disabled text-headings--do-scale"
B="text-body-text--do-paragraph text-body-text--do-meaning text-body-text--do-labels content-card--do-spacing forms-input--default forms-input--small forms-input--disabled"
for t in default catppuccin-mocha thrifty-paper; do
  bg="$(magick android/$t-a.png -format '%[pixel:p{540,1800}]' info:)"
  fg="#222"; [ $t = catppuccin-mocha ] && fg="#cdd6f4"
  head() { magick -background "$bg" -fill "$fg" -font Adwaita-Sans-Bold -pointsize 48 label:"$1" -gravity center -extent 1080x100 "$2"; }
  sb=()
  for p in a b; do ids=$A; [ $p = b ] && ids=$B
    for id in $ids; do
      magick -background "$bg" -fill "$fg" -font Adwaita-Mono -pointsize 26 label:"$id" -gravity west -extent 1080x44 sheet-parts/l.png
      magick sheet-parts/l.png "sb/$t-$p-$id.png" -background "$bg" -gravity northwest -append -extent 1080x sheet-parts/sb-$p-$id.png
      sb+=(sheet-parts/sb-$p-$id.png)
    done
  done
  head "Storybook" sheet-parts/h1.png; head "Expo web" sheet-parts/h2.png; head "Android (emulator)" sheet-parts/h3.png
  magick sheet-parts/h1.png "${sb[@]}" -background "$bg" -gravity northwest -append sheet-parts/c1.png
  magick sheet-parts/h2.png web/$t-a.png web/$t-b.png -background "$bg" -gravity northwest -append sheet-parts/c2.png
  magick sheet-parts/h3.png android/$t-a.png android/$t-b.png -background "$bg" -gravity northwest -append sheet-parts/c3.png
  magick sheet-parts/c1.png sheet-parts/c2.png sheet-parts/c3.png -background "$bg" -gravity north +append \
    -splice 0x90 -fill "$fg" -font Adwaita-Sans-Bold -pointsize 56 -annotate +0+16 "HC-192 · $t" sheet-$t.png
  echo "sheet-$t.png $(magick identify -format '%wx%h' sheet-$t.png)"
done
