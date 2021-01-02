const socket = io("localhost:3000");

// 获取用户登录信息
const getUserInfo = () => {
	const user = {};
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
	}
	alert(data.msg);
});

// 注册后端userList事件
socket.on("userList",(data) => {
	console.log(data)
})
