
# BOT Minecraft

ทำเพื่อการศึกษาเท่านั้น
## สิ่งที่ต้องโหลด

 - [Awesome Readme Templates](https://awesomeopensource.com/project/elangosundar/awesome-README-templates)
 - [Awesome README](https://github.com/matiassingers/awesome-readme)
 - [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)


## วิธีการติดตั้งและใช้งาน
 - [NodeJS](https://nodejs.org/en)

NPM ใช้คำสั่งนี้
```bash
  cd botmcjs
  npm install
```
Yarn ใช้คำสั่งนี้
```bash
  cd botmcjs
  yarn
```

จากนั้นแก้ ip เซิร์ฟหรือเว็บที่ .env

```bash
  HOST_SERVER="Address เซิร์ฟเวอร์"
  BOT_NAME="ชื่อตัวละคร"
  PORT_SERVER="Port ที่จะรันเว็บ"
  PORT_SERVER_MC="Port ของเซิร์ฟหากมี " 

```
  หากเซิร์ฟ Port ไม่มีให้ไปลบบรรทัด ที่มีคำว่า port: process.env.PORT_SERVER_MC || "",

  
## รันขึ้นเว็บ

```bash
cd botmcjs
node index.js
```
จากนั้นเข้าตาม PORT_SERVER เช่น http://localhost:3000/

