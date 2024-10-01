#!/bin/bash

# Script 4: Delete unused index.ts files

# Include Scripts 1, 2, and 3 code
find packages/components/src/ -mindepth 2 -maxdepth 2 -type f -name 'index.ts' > index_files.txt

grep -rE --exclude-dir='node_modules' --include='*.ts' --include='*.tsx' \
"from ['\"]@project/components/src/[^/]+(/index)?['\"]" . > import_usages.txt

awk -F'/' '{print $(NF-2)}' index_files.txt > component_names.txt

cut -d':' -f3- import_usages.txt | \
grep -oE "from ['\"]@project/components/src/([^/'\"]+)" | \
sed -E "s/from ['\"]@project\/components\/src\/([^/'\"]+).*/\1/" > used_components_raw.txt

sort -u used_components_raw.txt > used_components.txt
sort -u component_names.txt > all_components.txt

comm -23 all_components.txt used_components.txt > unused_components.txt

grep -F -f unused_components.txt index_files.txt > unused_index_files.txt

# Delete the unused index.ts files
if [ -s unused_index_files.txt ]; then
    xargs -a unused_index_files.txt rm -v
    echo "Deleted unused index.ts files."
else
    echo "No unused index.ts files to delete."
fi
