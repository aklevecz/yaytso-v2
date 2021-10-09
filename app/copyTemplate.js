const fs = require("fs");
async function copyTemplate() {
  let template = fs.readFileSync("./build/index.html").toString();
  eggplate = template.replaceAll("/static/js", "https://yaytso.art/static/js");
  fs.writeFileSync(
    "../functions/src/template.ts",
    "export const template = `" + eggplate + "`"
  );
  const TITLE = "__TITLE__";
  const DESCRIPTION = "__DESCRIPTION__";
  let mainfile = template.toString();
  mainfile = mainfile.replace(TITLE, "yaytso - NFT eggs");
  mainfile = mainfile.replaceAll(
    DESCRIPTION,
    "yaytso - The egg NFT creation tool"
  );
  fs.writeFileSync("./build/index.html", mainfile);
}

copyTemplate();
