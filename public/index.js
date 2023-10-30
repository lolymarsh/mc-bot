(function (Vue, io) {
  "use strict";

  const apiPath = window.location;

  const app = Vue.createApp({
    data: function () {
      return {
        username: "",
        server_address: "",
        game_version: "",
        is_pending: false,
      };
    },
    methods: {
      getDataFromServer: async function () {
        const self = this;
        try {
          self.is_pending = true;

          const data_username = localStorage.getItem("username");
          const data_server_address = localStorage.getItem("server_address");

          if (data_username !== null || data_username !== "") {
            self.username = data_username;
          }

          if (data_server_address !== null || data_server_address !== "") {
            self.server_address = data_server_address;
          }

          const response = await fetch(`${apiPath}get-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (data?.status) {
            window.location = "/management";
          }

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
      SendConnectServer: async function () {
        const self = this;
        try {
          self.is_pending = true;

          if (self.username.length == "") {
            self.is_pending = false;
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกชื่อ",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (self.username.length < 4) {
            self.is_pending = false;
            return Swal.fire({
              icon: "error",
              title: "ชื่อต้องมีอย่างน้อย 4 ตัวอักษรและบังคับเป็นภาษาอังกฤษ",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (self.server_address < 4) {
            self.is_pending = false;
            return Swal.fire({
              icon: "error",
              title:
                "ไอพีแอดเดรสต้องมีอย่างน้อย 4 ตัวอักษรและบังคับเป็นภาษาอังกฤษ",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          if (self.server_address == "") {
            self.is_pending = false;
            return Swal.fire({
              icon: "error",
              title: "กรุณากรอกไอพีแอดเดรส",
              showConfirmButton: false,
              timer: 1500,
            });
          }

          localStorage.setItem("username", self.username);
          localStorage.setItem("server_address", self.server_address);

          const response = await fetch(`${apiPath}create-bot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              server_address: self.server_address,
              username: self.username,
            }),
          });

          const data = await response.json();

          if (data?.status !== false) {
            window.location = "/management";
          }

          self.is_pending = false;
          return;
        } catch (error) {
          console.log(error);
          return Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      },
    },
    mounted: async function () {
      const self = this;
      try {
        await self.getDataFromServer();
      } catch (error) {
        console.log(error);
      } finally {
      }
    },
  });

  const vue = app.mount("#kt_app_root");
})(Vue, io);
