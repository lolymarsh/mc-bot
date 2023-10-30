
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

## ตัวอย่างเข้าใช้งาน

![alt text](https://media.discordapp.net/attachments/866943161456394240/1168606157527580693/image.png?ex=6552604b&is=653feb4b&hm=3994b5f16ab0587e8d6a93ed49dfc8c2889cf92e40728771f12022bba48fb7a6&=&width=963&height=478)

![alt text](https://media.discordapp.net/attachments/866943161456394240/1168606571610243152/image.png?ex=655260ae&is=653febae&hm=b708f597622faa4fb9685ded77387fae12646b7d261a9c38cfce460d08415354&=&width=422&height=535)
