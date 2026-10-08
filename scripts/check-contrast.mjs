import fs from "node:fs";
const read=(name)=>JSON.parse(fs.readFileSync(new URL(`../packages/ui/tokens/${name}.json`,import.meta.url),"utf8"));
function luminance(hex){const rgb=hex.slice(1).match(/.{2}/g).map(part=>parseInt(part,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]}
function ratio(a,b){const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(values[0]+.05)/(values[1]+.05)}
const readGroup=(name)=>Object.fromEntries(fs.readdirSync(new URL(`../packages/ui/tokens/${name}/`,import.meta.url)).filter(file=>file.endsWith(".json")).map(file=>[file.slice(0,-5),read(`${name}/${file.slice(0,-5)}`)]));
const core=readGroup("core"),semantic=readGroup("semantic"),button=read("components/button");
const lookup=(path)=>path.split(".").reduce((node,key)=>node[key],{core,semantic,button});
const resolve=(token,mode)=>{const raw=mode&&typeof token.$value==="object"?token.$value[mode]:token.$value;if(typeof raw==="string"&&/^\{.+\}$/.test(raw))return resolve(lookup(raw.slice(1,-1)),mode);return raw};
let failed=false;
for(const mode of ["light","dark"]){
  const checks = [
    ["text/primary on background/app", resolve(semantic.text.primary,mode), resolve(semantic.background.app,mode), 4.5, true],
    ...["default","subtle","muted","strong"].flatMap(name => [
      [`text/primary on surface/${name}`, resolve(semantic.text.primary,mode), resolve(semantic.surface[name],mode), 4.5, true],
      [`text/secondary on surface/${name}`, resolve(semantic.text.secondary,mode), resolve(semantic.surface[name],mode), 4.5, true],
    ]),
    ...["default","subtle"].map(name => [`text/tertiary on surface/${name}`, resolve(semantic.text.tertiary,mode), resolve(semantic.surface[name],mode), 4.5, true]),
    ["text/inverse on surface/inverse", resolve(semantic.text.inverse,mode), resolve(semantic.surface.inverse,mode), 4.5, true],
    ["button/solid content on surface/accent", resolve(button.solid.content,mode), resolve(button.solid.surface,mode), 4.5, true],
  ];
  for(const[name,fg,bg,minimum,required]of checks){const actual=ratio(fg,bg);const pass=actual>=minimum;console.log(`${pass?"PASS":required?"FAIL":"WARN"} ${mode}: ${name} ${actual.toFixed(2)}:1`);if(required&&!pass)failed=true}
}
process.exitCode=failed?1:0;
