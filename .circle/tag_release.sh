#!/usr/bin/env bash

TAG_NAME="v$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]')"

if git ls-remote --tags --quiet | egrep "$TAG_NAME$"
then
    echo "tag $TAG_NAME already exists. Omitting tagging."
else
    git tag -a $TAG_NAME -m "[$TAG_NAME]"
    git push --tags
fi
