(function (Vue, io) {
  "use strict";

  const apiPath = window.location;

  const app = Vue.createApp({
    data: function () {
      return {
        ws: null,
        message: "",
        x_pos: "",
        y_pos: "",
        z_pos: "",
        showInventory: "inactive",
        dataInventory: [],
      };
    },
    methods: {
      initWebSocket: function () {
        const self = this;
        const socket = io();
        self.ws = socket;
        self.ws = io("http://localhost:3000");
        socket.on("chat-message", (message) => {
          const chatBox = document.getElementById("chat-box"); // ใช้ getElementById โดยไม่ต้องใส่จุด (.)
          const chatMessage = document.createElement("p");
          chatMessage.textContent = message; // ใช้ textContent เพื่อแสดงข้อความเท่านั้น
          chatBox.appendChild(chatMessage);
        });
      },
      sendCommand: async function () {
        try {
          const self = this;
          const response = await fetch(`${apiPath}command`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: self.message }),
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.log(error);
        }
      },
      sendPosition: async function () {
        try {
          const self = this;
          const response = await fetch(`${apiPath}send-pos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              x_pos: self.x_pos,
              y_pos: self.y_pos,
              z_pos: self.z_pos,
            }),
          });
          self.x_pos = "";
          self.y_pos = "";
          self.z_pos = "";
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.log(error);
        }
      },
      checkInventory: async function () {
        try {
          const self = this;
          const response = await fetch(`${apiPath}check-inventory`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          self.dataInventory = data?.datas;

          self.showInventory = "active";
        } catch (error) {
          console.log(error);
        }
      },
      clickHideInventory: function () {
        const self = this;
        console.log(self.showInventory);
        self.showInventory = "inactive";
      },
      ItemToHand: async function (nameItem) {
        try {
          const response = await fetch(`${apiPath}hold-item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameItem,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.log(error);
        }
      },
      dropItem: async function (nameItem, quantity) {
        try {
          const response = await fetch(`${apiPath}drop-item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameItem,
              count: quantity,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.log(error);
        }
      },
      showModalSwal(item) {
        const self = this;

        Swal.fire({
          title: "กรุณากรอกข้อมูล",
          html: `
        <div class="swal-content">
            <input id="name" class="swal2-input" placeholder="ชื่อ" disabled value="${item.name}">
            <input id="quantity" type="number" class="swal2-input" placeholder="จำนวน" value="${item.stackSize}">
        </div>
    `,
          showCancelButton: true,
          confirmButtonText: "ตกลง",
          cancelButtonText: "ยกเลิก",
        }).then((result) => {
          if (result.isConfirmed) {
            const name = document.getElementById("name").value;
            const quantityInput = document.getElementById("quantity");
            const quantity = quantityInput.value;

            // ตรวจสอบว่าค่าจำนวนเกินค่า stackSize หรือไม่
            if (quantity > item.stackSize) {
              Swal.fire({
                icon: "error",
                title: "ข้อผิดพลาด",
                text: "คุณกรอกจำนวนเกินค่าที่มี",
              });
            } else {
              self.dropItem(name, quantity);
              Swal.fire({
                icon: "success",
                title: "โยนไอเทมสำเร็จ",
                showConfirmButton: false,
                timer: 1500,
              });
            }
          }
        });
      },
    },
    mounted: async function () {
      const self = this;
      await self.initWebSocket();
    },
  });

  const vue = app.mount("#kt_app_root");
})(Vue, io);
