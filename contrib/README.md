#### Publishing a new SDK version

```bash
# bump the version in package.json
npm version patch --no-git-tag-version

# do a fresh build of everything in dist/
npm run build

# create a commit + tag for this npm version
export PACKAGE_VERSION=`node -e 'console.log(require("./package.json").version)'`
git commit -a -m "Release v$PACKAGE_VERSION"
LAST_VERSION=`git describe --tags $(git rev-list --tags --max-count=1)`
BODY=`git log --no-merges $LAST_VERSION..HEAD --pretty="format:%s (%h); %an"`
BODY="\nChangelog since $LAST_VERSION:\n$BODY"
git tag -a "v$PACKAGE_VERSION" -m "$BODY"

# make live
git push upstream && git push upstream --tags
npm publish
```
