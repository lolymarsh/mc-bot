
# BOT Minecraft

ทำเพื่อการศึกษาเท่านั้น
## สิ่งที่ต้องโหลด

- [NodeJS](https://nodejs.org/en)


## วิธีการติดตั้งและใช้งาน
Npm ใช้คำสั่งนี้
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

## ตัวอย่าง

![alt text](https://media.discordapp.net/attachments/738757840621273210/1167367978011074581/image.png?ex=654ddf26&is=653b6a26&hm=42b74c6e8a739cce7dcd52538d2f6fc042093fcee54cb5c3717369061c5360b3&=&width=1354&height=676)

