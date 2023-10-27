(function (Vue, io) {
  "use strict";

  const apiPath = window.location;

  const app = Vue.createApp({
    data: function () {
      return {
        ws: null,
        showInventory: "inactive",
        dataInventory: [],
        farmMode: "",
        isEnabled: false,
        serverAddress: "",
        is_pending: false,
        inputs: [],
        inputsPos: [],
      };
    },
    methods: {
      initWebSocket: function () {
        const self = this;
        const socket = io();
        self.ws = socket;
        self.ws = io("http://localhost:3000");
        // Chat Game
        socket.on("chat-message", (message) => {
          const chatBox = document.getElementById("chat-box"); // ใช้ getElementById โดยไม่ต้องใส่จุด (.)
          const chatMessage = document.createElement("p");
          chatMessage.classList.add("text-light");
          chatMessage.textContent = message; // ใช้ textContent เพื่อแสดงข้อความเท่านั้น
          chatBox.appendChild(chatMessage);
        });

        // Chat Bot
        socket.on("chat-bot", (message) => {
          const chatBox = document.getElementById("chat-bot"); // ใช้ getElementById โดยไม่ต้องใส่จุด (.)
          const chatMessage = document.createElement("p");
          chatMessage.classList.add("text-info");
          chatMessage.textContent = message;
          chatBox.appendChild(chatMessage);
        });

        socket.on("chat-error", (message) => {
          const chatBox = document.getElementById("chat-bot");
          const chatMessage = document.createElement("p");
          chatMessage.textContent = message;
          chatBox.appendChild(chatMessage);
        });

        socket.on("chat-bot-enable", (message) => {
          const chatBox = document.getElementById("chat-bot"); // ใช้ getElementById โดยไม่ต้องใส่จุด (.)
          const chatMessage = document.createElement("p");
          chatMessage.classList.add("text-success");
          chatMessage.textContent = message;
          chatBox.appendChild(chatMessage);
        });

        socket.on("chat-bot-disable", (message) => {
          const chatBox = document.getElementById("chat-bot"); // ใช้ getElementById โดยไม่ต้องใส่จุด (.)
          const chatMessage = document.createElement("p");
          chatMessage.classList.add("text-warning");
          chatMessage.textContent = message;
          chatBox.appendChild(chatMessage);
        });
        // Chat Bot

        socket.on("chat-farm-pumpkin", (message) => {
          const chatFarmPumpkin = document.getElementById("chat-pumpkin");
          const chatMessageFarmPumpkin = document.createElement("p");
          chatMessageFarmPumpkin.textContent = message;
          chatMessageFarmPumpkin.classList.add("text-warning");
          chatFarmPumpkin.appendChild(chatMessageFarmPumpkin);
        });

        socket.on("chat-farm-wheat", (message) => {
          const chatFarmWheat = document.getElementById("chat-wheat");
          const chatMessageFarmWheat = document.createElement("p");
          chatMessageFarmWheat.textContent = message;
          chatMessageFarmWheat.classList.add("text-warning");
          chatFarmWheat.appendChild(chatMessageFarmWheat);
        });
      },
      sendCommand: async function (item) {
        const self = this;
        try {
          if (item.message === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ข้อความก่อนส่ง",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_pending = true;
          await fetch(`${apiPath}command`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: item.message }),
          });

          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "ส่งคำสั่งสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      sendPosition: async function (item) {
        const self = this;
        try {
          if (item.x_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง X",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (item.y_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง Y",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (item.z_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง Z",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_pending = true;
          await fetch(`${apiPath}send-pos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              x_pos: item.x_pos,
              y_pos: item.y_pos,
              z_pos: item.z_pos,
            }),
          });

          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "สั่งบอทเคลื่อนที่สำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          self.is_pending = true;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      checkInventory: async function () {
        const self = this;
        try {
          self.is_pending = true;
          const response = await fetch(`${apiPath}check-inventory`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          self.dataInventory = data?.datas;
          self.showInventory = "active";
          self.is_pending = false;
          return;
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      clickHideInventory: function () {
        const self = this;
        self.showInventory = "inactive";
      },
      ItemToHand: async function (nameItem) {
        const self = this;
        try {
          self.is_pending = true;
          await fetch(`${apiPath}hold-item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameItem,
            }),
          });

          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "ถือไอเทมสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      dropItem: async function (nameItem, quantity) {
        const self = this;
        try {
          self.is_pending = true;
          await fetch(`${apiPath}drop-item`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameItem,
              count: quantity,
            }),
          });
          await self.checkInventory();
          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "โยนไอเทมสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
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
        }).then(async (result) => {
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
              return;
            } else {
              await self.dropItem(name, quantity);
            }
          }
        });
      },
      ToggleFarmPumpkin: async function () {
        const self = this;
        try {
          self.isEnabled = !self.isEnabled;
          self.farmMode = "pumpkin_farm";
          self.is_pending = true;
          await fetch(`${apiPath}farm-pumpkin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          self.is_pending = false;
          if (self.isEnabled) {
            return Swal.fire({
              icon: "success",
              title: "เปิดใช้งานออโต้ฟาร์มฟักทองสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            return Swal.fire({
              icon: "success",
              title: "ปิดใช้งานออโต้ฟาร์มฟักทองสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      ToggleFarmWheat: async function () {
        const self = this;
        try {
          self.isEnabled = !self.isEnabled;
          self.farmMode = "wheat_farm";
          self.is_pending = true;
          const response = await fetch(`${apiPath}farm-wheat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          self.is_pending = false;
          if (self.isEnabled) {
            return Swal.fire({
              icon: "success",
              title: "เปิดใช้งานออโต้ฟาร์มข้าวสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            return Swal.fire({
              icon: "success",
              title: "ปิดใช้งานออโต้ฟาร์มข้าวสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      gotoSurvivalAmorycraft: async function () {
        const self = this;
        try {
          self.is_pending = true;
          const response = await fetch(`${apiPath}amory-join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "เข้าสู่เซิร์ฟ Survival Amorycraft เรียบร้อย",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      getDataFromServer: async function () {
        const self = this;
        try {
          self.is_pending = true;
          const response = await fetch(`${apiPath}get-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();

          self.serverAddress = data?.ServerAddress;
          self.is_pending = false;
          return;
        } catch (error) {
          self.is_pending = false;
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
      showModalAddCommandInput(item, index) {
        const self = this;
        if (item) {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input" value="${item.name}" placeholder="ชื่อ">
        <input id="message" type="text" class="swal2-input" value="${item.message}" placeholder="คำสั่ง">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const message = document.getElementById("message").value;

              const itemToGive = {
                name: name,
                message: message,
              };

              self.editInputCommand(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input" placeholder="ชื่อ">
        <input id="message" type="text" class="swal2-input" placeholder="คำสั่ง">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const message = document.getElementById("message").value;

              const itemToGive = {
                name: name,
                message: message,
              };

              self.addInputCommand(itemToGive);
              return;
            }
          });
        }
      },
      addInputCommand(item) {
        const self = this;

        if (item.name === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกชื่อคำสั่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.message === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกคำสั่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        self.inputs.push({ name: item.name, message: item.message });

        localStorage.setItem("commandInputs", JSON.stringify(self.inputs));
      },
      editInputCommand(item, index) {
        const self = this;

        if (item.name === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกชื่อคำสั่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.message === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกคำสั่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }
        self.inputs[index] = item;

        localStorage.setItem("commandInputs", JSON.stringify(self.inputs));
      },
      deleteInputCommand(index) {
        const self = this;
        Swal.fire({
          icon: "warning",
          title: "คุณแน่ใจที่จะลบหรือไม่?",
          showCancelButton: true,
          confirmButtonText: "ตกลง",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            self.inputs.splice(index, 1);

            localStorage.setItem("commandInputs", JSON.stringify(self.inputs));
            return;
          }
        });
      },
      showModalAddPositionInput(item, index) {
        const self = this;
        if (item) {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input" value="${item.name}" placeholder="ชื่อ">
        <input id="x_pos" type="text" class="swal2-input" value="${item.x_pos}" placeholder="ตำแหน่ง X">
        <input id="y_pos" type="text" class="swal2-input" value="${item.y_pos}" placeholder="ตำแหน่ง Y">
        <input id="z_pos" type="text" class="swal2-input" value="${item.z_pos}" placeholder="ตำแหน่ง Z">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const xpos = document.getElementById("x_pos").value;
              const ypos = document.getElementById("y_pos").value;
              const zpos = document.getElementById("z_pos").value;

              const itemToGive = {
                name: name,
                x_pos: xpos,
                y_pos: ypos,
                z_pos: zpos,
              };

              self.editInputPosition(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input"   placeholder="ชื่อ">
        <input id="x_pos" type="text" class="swal2-input"  placeholder="ตำแหน่ง X">
        <input id="y_pos" type="text" class="swal2-input"  placeholder="ตำแหน่ง Y">
        <input id="z_pos" type="text" class="swal2-input"  placeholder="ตำแหน่ง Z">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const xpos = document.getElementById("x_pos").value;
              const ypos = document.getElementById("y_pos").value;
              const zpos = document.getElementById("z_pos").value;

              const itemToGive = {
                name: name,
                x_pos: xpos,
                y_pos: ypos,
                z_pos: zpos,
              };

              self.addInputPosition(itemToGive);
              return;
            }
          });
        }
      },
      addInputPosition(item) {
        const self = this;

        if (item.name === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกชื่อตำแหน่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.x_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง X",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.y_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Y",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.z_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Z",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        self.inputsPos.push({
          name: item.name,
          x_pos: item.x_pos,
          y_pos: item.y_pos,
          z_pos: item.z_pos,
        });

        localStorage.setItem("PositionInputs", JSON.stringify(self.inputsPos));
      },
      editInputPosition(item, index) {
        const self = this;

        if (item.name === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกชื่อตำแหน่ง",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.x_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง X",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.y_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Y",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.z_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Z",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        self.inputsPos[index] = item;

        localStorage.setItem("PositionInputs", JSON.stringify(self.inputsPos));
      },
      deleteInputPosition(index) {
        const self = this;
        Swal.fire({
          icon: "warning",
          title: "คุณแน่ใจที่จะลบหรือไม่?",
          showCancelButton: true,
          confirmButtonText: "ตกลง",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            self.inputsPos.splice(index, 1);

            localStorage.setItem(
              "PositionInputs",
              JSON.stringify(self.inputsPos)
            );
            return;
          }
        });
      },
    },
    mounted: async function () {
      const self = this;
      await self.initWebSocket();
      await self.getDataFromServer();

      const savedInputs = localStorage.getItem("commandInputs");
      const savedInputsPosition = localStorage.getItem("PositionInputs");
      if (savedInputs) {
        self.inputs = JSON.parse(savedInputs);
      }

      if (savedInputsPosition) {
        self.inputsPos = JSON.parse(savedInputsPosition);
      }
    },
  });

  const vue = app.mount("#kt_app_root");
})(Vue, io);
