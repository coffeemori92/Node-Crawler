import puppeteer from 'puppeteer';

const crawler = async () => {
    try{
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1536, 864', '--disable-notifications']
        });
        const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36');
            await page.setViewport({
                width: 1536,
                height: 864
            });
            const keyword = 'crawler';
            await page.goto(`https://github.com/search?q=${keyword}`, {
                waitUntil: 'networkidle0'
            });
            let result = [];
            let pageNum = 1;
            while(pageNum < 11){
                const r = await page.evaluate(() => {
                    const tags = document.querySelectorAll('.repo-list-item');
                    const result = [];
                    tags.forEach(t => {
                        result.push({
                            name: t && t.querySelector('.f4.text-normal') && t.querySelector('.f4.text-normal').textContent.trim(),
                            star: t && t.querySelector('.muted-link') && t.querySelector('.muted-link').textContent.trim(),
                            lang: t && t.querySelector('span[itemprop="programmingLanguage"]') && t.querySelector('span[itemprop="programmingLanguage"]').textContent.trim()
                        });
                    });
                    return result;
                });
                result.push(r);
                await page.waitForSelector('a.next_page');
                await page.waitFor(3000);
                await page.click('a.next_page');
                pageNum++;
            }
            console.log(result.length);
            console.log(result[0]);
            // await page.close();
            // await browser.close();
    }catch(e){
        console.log(e);
    }
};

crawler();