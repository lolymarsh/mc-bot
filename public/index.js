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
        inputsFacePos: [
          { name: "North", x_pos: "0", z_pos: "0" },
          { name: "South", x_pos: "3", z_pos: "0" },
          { name: "East", x_pos: "-1.5", z_pos: "0" },
          { name: "West", x_pos: "1.5", z_pos: "0" },
        ],
        window_items: [],
        loop_message: "",
        loop_time: "",
        is_enable_loop: false,
        delay_left_click: "",
        is_enable_auto_left_click: false,
        disable_auto_left_click_input: false,
        disable_loop_command_input: false,
        text_enabled: false,
        loop_function: [],
        reqSortable: [],
        sortableData: [],
        is_Loop_function_enabled: false,
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

        socket.on("window-opened", (message) => {
          if (message) {
            self.window_items.push(message);
          }
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
      SendWatchAndBreak: async function (item) {
        const self = this;
        try {
          if (item.name_block === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ชื่อบล็อค",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_pending = true;
          await fetch(`${apiPath}watch-item-and-break`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: item.name_block }),
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
      sendCommandLoop: async function () {
        const self = this;
        try {
          if (self.loop_message === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ข้อความก่อนส่ง",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (self.loop_time === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ดีเลย์ก่อนส่ง",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_enable_loop = !self.is_enable_loop;

          self.is_pending = true;
          await fetch(`${apiPath}loop-command`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: self.loop_message,
              loop_time: self.loop_time,
            }),
          });

          self.is_pending = false;
          if (self.is_enable_loop) {
            self.disable_loop_command_input = true;
            return Swal.fire({
              icon: "success",
              title: "เปิดใช้งานสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            self.disable_loop_command_input = false;
            Swal.fire({
              icon: "success",
              title: "ปิดใช้งานสำเร็จ",
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
      ToggleAutoLeftClick: async function () {
        const self = this;
        try {
          if (self.delay_left_click === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ดีเลย์ก่อนเปิดใช้งาน",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_enable_auto_left_click = !self.is_enable_auto_left_click;

          self.is_pending = true;
          await fetch(`${apiPath}autoclick-left`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              delay: self.delay_left_click,
            }),
          });

          self.is_pending = false;
          if (self.is_enable_auto_left_click) {
            self.disable_auto_left_click_input = true;
            return Swal.fire({
              icon: "success",
              title: "เปิดใช้งานสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            self.disable_auto_left_click_input = false;
            Swal.fire({
              icon: "success",
              title: "ปิดใช้งานสำเร็จ",
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
      sendFacePosition: async function (item) {
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

          if (item.z_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง Z",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_pending = true;
          await fetch(`${apiPath}send-face-pos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pos_yaw: item.x_pos,
              pos_pitch: item.z_pos,
            }),
          });

          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "สั่งบอทหันหน้าสำเร็จ",
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
      checkWindow: async function () {
        const self = this;
        try {
          self.is_pending = true;
          const response = await fetch(`${apiPath}check-window`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          console.log(data);
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
      ItemToHandAndRightClick: async function (nameItem) {
        const self = this;
        try {
          self.is_pending = true;
          await fetch(`${apiPath}hold-item-right-click`, {
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
            title: "ถือและคลิกขวาสำเร็จ",
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
      showModalAddFacePositionInput(item, index) {
        const self = this;
        if (item) {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input" value="${item.name}" placeholder="ชื่อ">
        <input id="x_pos" type="text" class="swal2-input" value="${item.x_pos}" placeholder="ตำแหน่ง Yaw">
        <input id="z_pos" type="text" class="swal2-input" value="${item.z_pos}" placeholder="ตำแหน่ง Pitch">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const xpos = document.getElementById("x_pos").value;
              const zpos = document.getElementById("z_pos").value;

              const itemToGive = {
                name: name,
                x_pos: xpos,
                z_pos: zpos,
              };

              self.editInputFacePosition(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "กรุณากรอกข้อมูล",
            html: `
        <div class="swal-content">
        <input id="name" type="text" class="swal2-input"   placeholder="ชื่อ">
        <input id="x_pos" type="text" class="swal2-input"  placeholder="ตำแหน่ง Yaw">
        <input id="z_pos" type="text" class="swal2-input"  placeholder="ตำแหน่ง Pitch">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const name = document.getElementById("name").value;
              const xpos = document.getElementById("x_pos").value;
              const zpos = document.getElementById("z_pos").value;

              const itemToGive = {
                name: name,
                x_pos: xpos,
                z_pos: zpos,
              };

              self.addInputFacePosition(itemToGive);
              return;
            }
          });
        }
      },
      addInputFacePosition(item) {
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

        if (item.z_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Z",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (!self.inputsFacePos) {
          self.inputsFacePos = [];
        }

        self.inputsFacePos.push({
          name: item.name,
          x_pos: item.x_pos,
          z_pos: item.z_pos,
        });

        localStorage.setItem(
          "FacePositionInputs",
          JSON.stringify(self.inputsFacePos)
        );
      },
      editInputFacePosition(item, index) {
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

        if (item.z_pos === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณากรอกตำแหน่ง Z",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        self.inputsFacePos[index] = item;

        localStorage.setItem(
          "FacePositionInputs",
          JSON.stringify(self.inputsFacePos)
        );
      },
      deleteInputFacePosition(index) {
        const self = this;
        Swal.fire({
          icon: "warning",
          title: "คุณแน่ใจที่จะลบหรือไม่?",
          showCancelButton: true,
          confirmButtonText: "ตกลง",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            self.inputsFacePos.splice(index, 1);

            localStorage.setItem(
              "FacePositionInputs",
              JSON.stringify(self.inputsFacePos)
            );
            return;
          }
        });
      },
      showModalAddLoopFuncSendCommand(item, index) {
        const self = this;

        if (item) {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="message" type="text" class="swal2-input" value="${item.message}" placeholder="คำสั่ง">
        <input id="delay_func" type="number" class="swal2-input" value="${item.delay_function}" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const message = document.getElementById("message").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendCommand",
                name_th: "ส่งคำสั่งหรือส่งแชท",
                message: message,
                delay_function: delay_function,
              };

              self.editLoopfunctoLocal(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="message" type="text" class="swal2-input" placeholder="คำสั่ง">
        <input id="delay_func" type="number" class="swal2-input" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const message = document.getElementById("message").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendCommand",
                name_th: "ส่งคำสั่งหรือส่งแชท",
                message: message,
                delay_function: delay_function,
              };

              self.addLoopfunctoLocal(itemToGive);
              return;
            }
          });
        }
      },
      showModalAddLoopFuncSendLocation(item, index) {
        const self = this;

        if (item) {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="x_pos" type="number" class="swal2-input" value="${item.x_pos}" placeholder="ตำแหน่ง X">
        <input id="y_pos" type="number" class="swal2-input" value="${item.y_pos}" placeholder="ตำแหน่ง Y">
        <input id="z_pos" type="number" class="swal2-input" value="${item.z_pos}" placeholder="ตำแหน่ง Z">
        <input id="delay_func" type="number" class="swal2-input" value="${item.delay_function}" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const xpos = document.getElementById("x_pos").value;
              const ypos = document.getElementById("y_pos").value;
              const zpos = document.getElementById("z_pos").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendPosition",
                name_th: "ส่งตำแหน่งให้บอทเดิน",
                x_pos: xpos,
                y_pos: ypos,
                z_pos: zpos,
                delay_function: delay_function,
              };

              self.editLoopfunctoLocal(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="x_pos" type="number" class="swal2-input" placeholder="ตำแหน่ง X">
        <input id="y_pos" type="number" class="swal2-input" placeholder="ตำแหน่ง Y">
        <input id="z_pos" type="number" class="swal2-input" placeholder="ตำแหน่ง Z">
        <input id="delay_func" type="number" class="swal2-input" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const xpos = document.getElementById("x_pos").value;
              const ypos = document.getElementById("y_pos").value;
              const zpos = document.getElementById("z_pos").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendPosition",
                name_th: "ส่งตำแหน่งให้บอทเดิน",
                x_pos: xpos,
                y_pos: ypos,
                z_pos: zpos,
                delay_function: delay_function,
              };
              self.addLoopfunctoLocal(itemToGive);
              return;
            }
          });
        }
      },
      showModalAddLoopFuncSendFacePos(item, index) {
        const self = this;

        if (item) {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="x_pos" type="text" class="swal2-input" value="${item.x_pos}" placeholder="ตำแหน่ง Yaw">
        <input id="z_pos" type="text" class="swal2-input" value="${item.z_pos}" placeholder="ตำแหน่ง Pitch">
        <input id="delay_func" type="number" class="swal2-input" value="${item.delay_function}" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const xpos = document.getElementById("x_pos").value;
              const zpos = document.getElementById("z_pos").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendFacePosition",
                name_th: "ส่งตำแหน่งหน้าให้บอทหันหน้า",
                x_pos: xpos,
                z_pos: zpos,
                delay_function: delay_function,
              };

              self.editLoopfunctoLocal(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="x_pos" type="text" class="swal2-input" placeholder="ตำแหน่ง Yaw">
        <input id="z_pos" type="text" class="swal2-input" placeholder="ตำแหน่ง Pitch">
        <input id="delay_func" type="number" class="swal2-input" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const xpos = document.getElementById("x_pos").value;
              const zpos = document.getElementById("z_pos").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "sendFacePosition",
                name_th: "ส่งตำแหน่งหน้าให้บอทหันหน้า",
                x_pos: xpos,
                z_pos: zpos,
                delay_function: delay_function,
              };

              self.addLoopfunctoLocal(itemToGive);
              return;
            }
          });
        }
      },
      showModalAddLoopFuncAutoLeftClick(item, index) {
        const self = this;

        if (item) {
          Swal.fire({
            title: "เปิด/ปิด ออโต้คลิกซ้าย",
            html: `
        <div class="swal-content">
        <input id="delay_for_click_func" type="number" class="swal2-input" value="${item.delay_forclick_function}" placeholder="ดีเลย์ของการคลิก (ms)">
        <input id="delay_func" type="number" class="swal2-input" value="${item.delay_function}" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const delay_forclick_function = document.getElementById(
                "delay_for_click_func"
              ).value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "ToggleAutoLeftClick",
                name_th: "เปิด/ปิด ออโต้คลิกซ้าย",
                delay_forclick_function: delay_forclick_function,
                delay_function: delay_function,
              };

              self.editLoopfunctoLocal(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "รูปแบบการลูป",
            html: `
        <div class="swal-content">
        <input id="delay_for_click_func" type="number" class="swal2-input" placeholder="ดีเลย์ของการคลิก (ms)">
        <input id="delay_func" type="number" class="swal2-input" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const delay_forclick_function = document.getElementById(
                "delay_for_click_func"
              ).value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "ToggleAutoLeftClick",
                name_th: "เปิด/ปิด ออโต้คลิกซ้าย",
                delay_forclick_function: delay_forclick_function,
                delay_function: delay_function,
              };

              self.addLoopfunctoLocal(itemToGive);
              return;
            }
          });
        }
      },
      showModalAddLoopFuncWatchAndBreak(item, index) {
        const self = this;

        if (item) {
          Swal.fire({
            title: "ดูและทำลาย",
            html: `
        <div class="swal-content">
        <input id="name_block" type="text" class="swal2-input" value="${item.name_block}" placeholder="ชื่อของบล็อค">
        <input id="delay_func" type="number" class="swal2-input" value="${item.delay_function}" placeholder="ดีเลย์ขั้นต่ำ 100ms">
    </div>
    <a href="https://minecraftitemids.com/" target="_blank">ชื่อของบล็อคอ้างอิงจากเว็บนี้</a>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const block_name_id = document.getElementById("name_block").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "WatchAndBreak",
                name_th: "ดูและทำลาย",
                name_block: block_name_id,
                delay_function: delay_function,
              };

              self.editLoopfunctoLocal(itemToGive, index);
              return;
            }
          });
        } else {
          Swal.fire({
            title: "ดูและทำลาย",
            html: `
        <div class="swal-content">
        <input id="name_block" type="text" class="swal2-input" placeholder="ชื่อของบล็อค">
        <input id="delay_func" type="number" class="swal2-input" placeholder="ดีเลย์ขั้นต่ำ 100ms">
        
    </div>
    <a href="https://minecraftitemids.com/" target="_blank">ชื่อของบล็อคอ้างอิงจากเว็บนี้</a>`,
            showCancelButton: true,
            confirmButtonText: "ตกลง",
            cancelButtonText: "ยกเลิก",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const block_name_id = document.getElementById("name_block").value;
              const delay_function =
                document.getElementById("delay_func").value;

              const itemToGive = {
                name_func: "WatchAndBreak",
                name_th: "ดูและทำลาย",
                name_block: block_name_id,
                delay_function: delay_function,
              };

              self.addLoopfunctoLocal(itemToGive);
              return;
            }
          });
        }
      },
      addLoopfunctoLocal(item) {
        const self = this;

        if (item.delay_function === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณาระบุดีเลย์",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.delay_function < 100) {
          return Swal.fire({
            icon: "error",
            title: "กรุณาระบุดีเลย์ให้เกิน 100 มิลลิวินาที",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        // sendPosition
        if (item.name_func === "sendPosition") {
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
          self.loop_function.push({
            name_func: item.name_func,
            name_th: item.name_th,
            x_pos: item.x_pos,
            y_pos: item.y_pos,
            z_pos: item.z_pos,
            delay_function: item.delay_function,
          });
        }
        // sendPosition

        // sendCommand
        if (item.name_func === "sendCommand") {
          if (item.message === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกคำสั่ง",
              showConfirmButton: false,
              timer: 1500,
            });
          }
          self.loop_function.push({
            name_func: item.name_func,
            name_th: item.name_th,
            message: item.message,
            delay_function: item.delay_function,
          });
        }
        // sendCommand

        // sendFacePosition
        if (item.name_func === "sendFacePosition") {
          if (item.x_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง X",
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

          self.loop_function.push({
            name_func: item.name_func,
            name_th: item.name_th,
            x_pos: item.x_pos,
            z_pos: item.z_pos,
            delay_function: item.delay_function,
          });
        }
        // sendFacePosition

        // ToggleAutoLeftClick
        if (item.name_func === "ToggleAutoLeftClick") {
          if (item.delay_forclick_function === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกดีเลย์การคลิก",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.loop_function.push({
            name_func: item.name_func,
            name_th: item.name_th,
            delay_forclick_function: item.delay_forclick_function,
            delay_function: item.delay_function,
          });
        }
        // ToggleAutoLeftClick

        // WatchAndBreak
        if (item.name_func === "WatchAndBreak") {
          if (item.name_block === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาเลือกชื่อบล็อค",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.loop_function.push({
            name_func: item.name_func,
            name_th: item.name_th,
            name_block: item.name_block,
            delay_function: item.delay_function,
          });
        }
        // WatchAndBreak

        localStorage.setItem(
          "loopFunctionStorage",
          JSON.stringify(self.loop_function)
        );
      },
      editLoopfunctoLocal(item, index) {
        const self = this;

        if (item.delay_function === "") {
          return Swal.fire({
            icon: "error",
            title: "กรุณาระบุดีเลย์",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        if (item.delay_function < 100) {
          return Swal.fire({
            icon: "error",
            title: "กรุณาระบุดีเลย์ให้เกิน 100 มิลลิวินาที",
            showConfirmButton: false,
            timer: 1500,
          });
        }

        // sendPosition
        if (item.name_func === "sendPosition") {
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

          self.loop_function[index] = item;
        }
        // sendPosition

        // sendCommand
        if (item.name_func === "sendCommand") {
          if (item.message === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกคำสั่ง",
              showConfirmButton: false,
              timer: 1500,
            });
          }
          self.loop_function[index] = item;
        }
        // sendCommand

        // sendFacePosition
        if (item.name_func === "sendFacePosition") {
          if (item.x_pos === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกตำแหน่ง X",
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

          self.loop_function[index] = item;
        }
        // sendFacePosition

        // ToggleAutoLeftClick
        if (item.name_func === "ToggleAutoLeftClick") {
          if (item.delay_forclick_function === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกดีเลย์การคลิก",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.loop_function[index] = item;
        }
        // ToggleAutoLeftClick
        // WatchAndBreak
        if (item.name_func === "WatchAndBreak") {
          if (item.name_block === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาเลือกชื่อบล็อค",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.loop_function[index] = item;
        }
        // WatchAndBreak

        localStorage.setItem(
          "loopFunctionStorage",
          JSON.stringify(self.loop_function)
        );
      },
      deleteLoopfunctoLocal(index) {
        const self = this;
        Swal.fire({
          icon: "warning",
          title: "คุณแน่ใจที่จะลบหรือไม่?",
          showCancelButton: true,
          confirmButtonText: "ตกลง",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            self.loop_function.splice(index, 1);

            localStorage.setItem(
              "loopFunctionStorage",
              JSON.stringify(self.loop_function)
            );
            return;
          }
        });
      },
      TextConvforLoopFunction: function (item) {
        try {
          // sendPosition
          if (item.name_func === "sendPosition") {
            return `X: ${item.x_pos} Y: ${item.y_pos} Z: ${item.z_pos}`;
          }
          // sendPosition
          // sendCommand
          if (item.name_func === "sendCommand") {
            if (item.message.includes("/")) {
              return `คำสั่ง ${item.message}`;
            } else {
              return `พิมพ์ ${item.message}`;
            }
          }
          // sendCommand
          // sendFacePosition
          if (item.name_func === "sendFacePosition") {
            return `X: ${item.x_pos} Z: ${item.z_pos}`;
          }
          // sendFacePosition
          // ToggleAutoLeftClick
          if (item.name_func === "ToggleAutoLeftClick") {
            return `One Click Per ${item.delay_forclick_function} ms`;
          }
          // ToggleAutoLeftClick
          // WatchAndBreak
          if (item.name_func === "WatchAndBreak") {
            return `บล็อคที่มอง ${item.name_block}`;
          }
          // WatchAndBreak
        } catch (error) {
          console.log(error);
        }
      },
      ToggleLoopFunction: async function () {
        try {
          const self = this;
          self.is_Loop_function_enabled = !self.is_Loop_function_enabled;

          // console.log(self.is_Loop_function_enabled);

          while (self.is_Loop_function_enabled) {
            for (const item of self.loop_function) {
              if (item.name_func === "sendPosition") {
                const dataToSend = {
                  x_pos: item.x_pos,
                  y_pos: item.y_pos,
                  z_pos: item.z_pos,
                };
                await self.sendPosition(dataToSend);
                await self.TimeSleep(item.delay_function);
              }

              if (item.name_func === "sendCommand") {
                const dataToSend = {
                  message: item.message,
                };
                await self.sendCommand(dataToSend);
                await self.TimeSleep(item.delay_function);
              }

              if (item.name_func === "sendFacePosition") {
                const dataToSend = {
                  x_pos: item.x_pos,
                  z_pos: item.z_pos,
                };

                await self.sendFacePosition(dataToSend);
                await self.TimeSleep(item.delay_function);
              }

              if (item.name_func === "ToggleAutoLeftClick") {
                const dataToSend = {
                  delay_left_click: item.delay_forclick_function,
                };

                await self.ToggleAutoLeftClickForLoop(dataToSend);
                await self.TimeSleep(item.delay_function);
              }

              if (item.name_func === "WatchAndBreak") {
                const dataToSend = {
                  name_block: item.name_block,
                };

                await self.SendWatchAndBreak(dataToSend);
                await self.TimeSleep(item.delay_function);
              }

              if (item.name_func === "") {
                break;
              }

              if (self.is_Loop_function_enabled === false) {
                break;
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
      ToggleAutoLeftClickForLoop: async function (item) {
        const self = this;
        try {
          if (item.delay_left_click === "") {
            return Swal.fire({
              icon: "error",
              title: "กรุณาใส่ดีเลย์ก่อนเปิดใช้งาน",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_enable_auto_left_click = !self.is_enable_auto_left_click;

          self.is_pending = true;
          await fetch(`${apiPath}autoclick-left`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              delay: item.delay_left_click,
            }),
          });

          self.is_pending = false;
          if (self.is_enable_auto_left_click) {
            self.disable_auto_left_click_input = true;
            return Swal.fire({
              icon: "success",
              title: "เปิดใช้งานสำเร็จ",
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            self.disable_auto_left_click_input = false;
            Swal.fire({
              icon: "success",
              title: "ปิดใช้งานสำเร็จ",
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
      TimeSleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },
      LocalStorageSaveToVariable: async function () {
        try {
          const self = this;

          const savedInputs = localStorage.getItem("commandInputs");
          const savedInputsPosition = localStorage.getItem("PositionInputs");
          const savedInputsFacePosition =
            localStorage.getItem("FacePositionInputs");
          const savedLoopFunc = localStorage.getItem("loopFunctionStorage");

          if (savedInputs) {
            // console.log(savedInputs);
            self.inputs = await JSON.parse(savedInputs);
          }

          if (savedInputsPosition) {
            self.inputsPos = await JSON.parse(savedInputsPosition);
          }

          if (savedLoopFunc) {
            self.loop_function = await JSON.parse(savedLoopFunc);
          }

          if (
            !savedInputsFacePosition ||
            JSON.parse(savedInputsFacePosition).length === 0
          ) {
            const data = [
              { name: "North", x_pos: "0", z_pos: "0" },
              { name: "South", x_pos: "3", z_pos: "0" },
              { name: "East", x_pos: "-1.5", z_pos: "0" },
              { name: "West", x_pos: "1.5", z_pos: "0" },
            ];
            localStorage.setItem("FacePositionInputs", JSON.stringify(data));
            self.inputsFacePos = data;
          } else {
            self.inputsFacePos = await JSON.parse(savedInputsFacePosition);
          }
        } catch (error) {
          console.log(error);
        }
      },
      initializeSortable: function () {
        const self = this;
        let containers = document.querySelectorAll(".draggable-zone");
        if (containers.length === 0) {
          return false;
        }

        if (self.loop_function.length > 0) {
          self.sortableData = new Sortable(containers[0], {
            draggable: ".draggable",
            handle: ".draggable .draggable-handle",
            mirror: {
              appendTo: "body",
              constrainDimensions: true,
            },
            onEnd: async function () {
              let slides = document.getElementsByClassName("draggable");
              let newArr = [];

              for (let i = 0; i < slides.length; i++) {
                let index = parseInt(slides[i].getAttribute("data-index"));
                newArr.push(self.loop_function[index]);
              }

              const item = localStorage.setItem(
                "loopFunctionStorage",
                JSON.stringify(newArr)
              );
              self.loop_function = await JSON.parse(item);
            },
          });
        }
      },
      sendClickSlotItem: async function (item) {
        try {
          console.log(item.slot);
          // return;
          if (item.slot === "") {
            return Swal.fire({
              icon: "error",
              title: "ไม่เจอ Slot",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          self.is_pending = true;
          await fetch(`${apiPath}click-slot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ slot: item.slot }),
          });

          self.is_pending = false;
          return Swal.fire({
            icon: "success",
            title: "ส่งคำสั่งสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.log(error);
        }
      },
      clearDataWindowSlot: async function () {
        const self = this;

        self.window_items = [];
      },
      TestClick: async function () {
        const self = this;

        self.text_enabled = true;

        await self.TimeSleep(3000);

        self.text_enabled = false;
      },
    },
    mounted: async function () {
      const self = this;
      try {
        self.is_pending = true;
        await self.initWebSocket();
        await self.getDataFromServer();
        await self.LocalStorageSaveToVariable();
        await self.initializeSortable();
      } catch (error) {
        console.log(error);
      } finally {
        self.is_pending = false;
      }
    },
  });

  const vue = app.mount("#kt_app_root");
})(Vue, io);
