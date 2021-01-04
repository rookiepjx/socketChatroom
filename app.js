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

const userList = [];
io.on("connection", (socket) => {
	console.log("-----用户已连接-----")

	// 1.用户登录成功，返回登录信息
	socket.on("login", (data) => {
		// 保存当前连接的用户
		socket.username = data.username
		socket.avatar = data.avatar
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

	// 2.
});
