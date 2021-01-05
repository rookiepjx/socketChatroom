const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

server.listen(3000, () => console.log("服务已启动在3000端口..."));

// app服务器监听请求
app.get("/", (req, res) => {
	res.redirect("/index.html");
});

// 开放静态资源
app.use(require("express").static("public"));

// 保存用户列表
const userList = [];

// 监听用户连接
io.on("connection", (socket) => {
	console.log("-----用户已连接-----");
	// 1.用户登录成功，返回用户列表，添加进入提示
	socket.on("login", (data) => {
		// 保存当前连接的用户
		socket.username = data.username;
		socket.avatar = data.avatar;
		let flag = userList.find((item) => item.username === data.username);
		if (flag) {
			socket.emit(
				"send",
				Object.assign(data, { status: 201, msg: "登录失败" })
			);
		} else {
			userList.push(data);
			const res = Object.assign(data, {
				status: 200,
				msg: "登录成功",
			});
			socket.emit("send", res);
			// 通过io对象广播事件
			io.emit("userList", userList);
			io.emit("userEnter", data.username);
		}
	});

	// 2.用户断开连接，更新用户列表，添加离开提示
	socket.on("disconnect", () => {
		let index = userList.findIndex((item) => item.username == socket.username);
		userList.splice(index, 1);
		// io对象广播离开事件
		io.emit("userLeave", socket.username);
		io.emit("userList", userList);
	});

	// 3.监听用户发送的消息并转发给所有人
	socket.on("msgToServer", (data) => {
		io.emit("msgToUsers", data);
	});

	// 4.监听用户发送的图片并转发给所有人
	socket.on("imgToServer",data => {
		io.emit("imgToUsers",data)
	})
});

//
