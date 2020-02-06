import puppeteer from 'puppeteer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

fs.readdir(path.join(__dirname, 'imgs'), err => {
    if(err){
        console.log('imgs폴더를 생성합니다.');
        fs.mkdirSync(path.join(__dirname, 'imgs'));
    }
});

const crawler = async () => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('https://unsplash.com');
      let result = [];
      while (result.length <= 30) {
        const srcs = await page.evaluate(() => {
          window.scrollTo(0, 0);
          let imgs = [];
          const imgEls = document.querySelectorAll('figure'); // 사이트 바뀌었을 때 클래스 적절히 바꾸기
          if (imgEls.length) {
            imgEls.forEach((v) => {
              let src = v.querySelector('img._2zEKz').src;
              if (src) {
                imgs.push(src);
              }
              v.parentElement.removeChild(v);
            });
          }
          window.scrollBy(0, 100);
          setTimeout(() => {
            window.scrollBy(0, 200);
          }, 500);
          return imgs;
        });
        result = result.concat(srcs);
        await page.waitForSelector('figure');
      }
      console.log(result);
      result.forEach(async (src) => {
        const imgResult = await axios.get(src.replace(/\?.*$/, ''), {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(path.join(__dirname, `imgs/${new Date().valueOf()}.jpg`), imgResult.data);
      });
      await page.close();
      await browser.close();
    } catch (e) {
      console.error(e);
    }
  };
  
  crawler();