import asyncio,sys
from playwright.async_api import async_playwright
Y,M,D1,D2=map(int,sys.argv[1:5])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome'); errs=[]; bad=[]
    pg=await b.new_page(viewport={'width':390,'height':844}); pg.on('pageerror',lambda e:errs.append(str(e)))
    for d in range(D1,D2+1):
      ds=f'{Y}-{M:02d}-{d:02d}T09:00'
      await pg.add_init_script(f"(()=>{{const F=new Date('{ds}').getTime();const O=Date;class D extends O{{constructor(...a){{if(a.length)super(...a);else super(F);}} static now(){{return F;}}}};window.Date=D;}})()")
      pg2=await b.new_page(viewport={'width':390,'height':844}); pg2.on('pageerror',lambda e:errs.append(str(e)))
      await pg2.add_init_script(f"(()=>{{const F=new Date('{ds}').getTime();const O=Date;class D extends O{{constructor(...a){{if(a.length)super(...a);else super(F);}} static now(){{return F;}}}};window.Date=D;}})()")
      await pg2.goto('file:///home/claude/bible-daily/preview.html'); await pg2.wait_for_timeout(300)
      r=await pg2.evaluate("()=>({src:storySrc.textContent.trim().slice(0,8),who:document.querySelectorAll('#storyText .who').length,raw:(storyText.textContent.match(/\\[\\[/g)||[]).length,rp:document.querySelectorAll('#reflectText .rp').length,story:storyText.textContent.slice(0,14)})")
      print(d,r)
      if r['raw'] or '準備中' in r['story']: bad.append(d)
      await pg2.close()
    print('bad',bad,'errors',errs); await b.close()
asyncio.run(main())
