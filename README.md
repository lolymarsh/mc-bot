
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

![alt text](https://media.discordapp.net/attachments/738757840621273210/1167321865941946418/image.png?ex=654db434&is=653b3f34&hm=131009cdcf2e56642b1bc60dc45854e2c73663e5857265b08537c1b2a79bbe90&=&width=1356&height=676)
