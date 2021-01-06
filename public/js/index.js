const socket = io("localhost:3000");
const user = {};
// 获取用户登录信息
const getUserInfo = () => {
	user.username = $("#username").val();
	user.password = $("#password").val();
	user.avatar = $(".avatar.selected img").attr("src");
	if (!user.username.trim()) {
		alert("请输入用户名");
	}
	if (!user.password.trim()) {
		alert("请输入密码");
	} else {
		socket.emit("login", user);
	}
};

// 点击头像添加边框样式
$(".avatars .avatar").click(function () {
	$(this).addClass("selected").siblings().removeClass("selected");
});

// 点击按钮登录
$(".btn").click(() => {
	getUserInfo();
});

// 注册后端send事件
socket.on("send", (data) => {
	console.log(data);
	// 登录成功
	if (data.status == 200) {
		$("#login").css("display", "none");
		$("#chat").css("display", "block");
		$(".loginUser").text(data.username);
		$(".loginAvatar img").attr("src", data.avatar);
	} else {
		// 登录失败
		$("#username").val("");
		$("#password").val("");
		alert(data.msg);
	}
});

// 注册后端userList事件
socket.on("userList", (userList) => {
	// 获取聊天室人数
	const userNum = userList.length;
	$(".userNum").text(`(${userNum})`);
	$(".userList").html("");
	const elements = userList.map((item) => {
		if (item.username == user.username) {
			return `<div class="info self">
								<div class="loginAvatar">
									<img src=${item.avatar} alt="" />
								</div>
								<div class="loginUser">${item.username}</div>
							</div>`;
		}
		return `<div class="info">
								<div class="loginAvatar">
									<img src=${item.avatar} alt="" />
								</div>
								<div class="loginUser">${item.username}</div>
							</div>`;
	});
	$(".userList").append(elements);
});

// 自动滚动到可视区的底部
const scrollIntoView = () => {
	$(".content").children(":last").get(0).scrollIntoView(false);
};

// 用户进入提示
socket.on("userEnter", (data) => {
	const ele = `<div class="msg_tips">"${data}"加入了群聊</div>`;
	$(".content").append(ele);
	scrollIntoView();
});

// 用户离开提示
socket.on("userLeave", (data) => {
	const ele = `<div class="msg_tips">"${data}"离开了群聊</div>`;
	$(".content").append(ele);
	scrollIntoView();
});

// 用户发送消息
$(".send").click(() => {
	// 1.在自己界面中添加消息框
	let msg = $(".input").html();
	$(".input").html("");
	msg = msg.replace(/&(nbsp;)/g,"").trim()
	if (!msg) {
		return;
	}
	// 2.将消息发到服务端转发给群成员
	socket.emit("msgToServer", {
		msg: msg,
		username: user.username,
		avatar: user.avatar,
	});
});

// 用户接受消息
socket.on("msgToUsers", (data) => {
	if (data.username == user.username) {
		const ele = `<div class="msg_send">
								<div class="msg_content">${data.msg}</div>
								<div class="msg_avatar">
									<img src="${data.avatar}" alt="" />
								</div>
							</div>`;
		$(".content").append(ele);
	} else {
		const ele = `<div class="msg_receive">
								<div class="msg_avatar">
									<img src="${data.avatar}" alt="" />
								</div>
								<div class="msg_content">${data.msg}</div>
							</div>`;
		$(".content").append(ele);
	}
	scrollIntoView();
});

// 用户发送图片
$("#file").on("change", function () {
	const file = this.files[0];
	const fr = new FileReader();
	fr.readAsDataURL(file);
	fr.onload = () => {
		socket.emit("imgToServer", {
			username: user.username,
			avatar: user.avatar,
			img: fr.result,
		});
	};
});

// 用户接受图片
socket.on("imgToUsers", (data) => {
	if (data.username == user.username) {
		const ele = `<div class="msg_send">
								<div class="msg_content"><img src="${data.img}" alt=""/></div>
								<div class="msg_avatar">
									<img src="${data.avatar}" alt="" />
								</div>
							</div>`;
		$(".content").append(ele);
	} else {
		const ele = `<div class="msg_receive">
								<div class="msg_avatar">
									<img src="${data.avatar}" alt="" />
								</div>
								<div class="msg_content"><img src="${data.img}" alt=""/></div>
							</div>`;
		$(".content").append(ele);
	}
	// 等待图片加载完成滚动到底部
	$(".msg_content img:last").on("load", () => {
		scrollIntoView();
	});
});

// 发送表情
$("#emoji").click(() => {
	$(".input").emoji({
		button: "#emoji",
		showTab: false,
		animation: "fade",
		icons: [
			{
				name: "QQ表情",
				path: "images/qq/",
				maxNum: 91,
				file: ".gif",
			},
			{
				name: "贴吧表情",
				path: "images/tieba/",
				maxNum: 50,
				file: ".jpg",
			},
		],
	});
});
