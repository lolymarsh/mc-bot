(function (Vue, io) {
  "use strict";

  const apiPath = window.location;

  const app = Vue.createApp({
    data: function () {
      return {
        ws: null,
        message: "",
        x_pos: 0,
        y_pos: 0,
        z_pos: 0,
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

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
        } catch (error) {
          console.log(error);
        }
      },
    },
    mounted: async function () {
      const self = this;
      await self.initWebSocket();
    },
  });

  const vue = app.mount("#kt_app_root");
})(Vue, io);
