$(document).ready(function(){
	var socket = io.connect(); 
	// 从cookie中读取用户名，存于变量from中
	var from = $.cookie('user'),
		photo = $.cookie('photo');
	//设置默认接收对象为所有人
	var to = 'all'; 
	// 发送用户上线信号
	socket.emit('online', {user: from});
	socket.on('online', function(data) {
		//显示系统消息
		if (data.user != from) {
			var sys = '<div class="system_message"><span>' + now() + ' ' + '用户' + data.user + '上线了</span></div>';
		} else {
			var sys = '<div class="system_message"><span>' + now() + ' 欢迎进入聊天室！</span></div>';
		}
		$('#contents').append(sys + '<br/>');
		//刷新用户列表
		flushUsers(data.users);
		//显示正在对谁说话
		//showSayTo();
	});

	socket.on('say', function(data) {
		console.log('收到say事件');
		//对所有人说
		if (data.to == 'all') {
			$("#contents").append('<div class="message_box clearfix"><img class="photo_img" alt="' 
				+ data.from + '" src="images/' + data.photo + '.jpg' 
				+ '"><div class="text_box"><p class="user_name">' + data.from 
				+ '</p><p class="text">' + data.msg + '</p></div></div><br />');
		} 
		//对你密语	
		if (data.to == from) {
			$("#contents").append('<div class="message_box clearfix"><img class="photo_img" alt="' 
				+ data.from + '" src="images/' + data.photo + '.jpg' 
				+ '"><div class="text_box"><p class="user_name">' + data.from 
				+ '对你说</p><p class="text spec">' + data.msg + '</p></div></div><br />');
		}
	})


	// 刷新用户在线列表
	function flushUsers(users) {
		/*//清空之前用户列表，添加“所有人”选项并默认为灰色选中效果
		$('#list').empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
		//遍历生成用户在线列表
		for (var i in users) {
			$('#list').append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
		}*/
		//双击对某人聊天
		$('#contain').on('dblclick', '.photo_img', function() {
			//如果不是双击自己的名字
			var name = $(this).attr('alt');
			if (name != from) {
				//设置被双击的用户为说话对象
				to = name;
				//清除之前的选中效果
				$('#input_content').attr('placeholder', '对' + name + '悄悄说:')
				//刷新正在对谁说话
				//showSayTo();
			}
		});
	}


	// //显示正在对谁说话
	// function showSayTo() {
	// 	$('#from').html(from);
	// 	$('#to').html(to == 'all' ? "所有人" : to);
	// }


	//获取当前时间
	function now() {
		var date = new Date();
		var time = date.getFullYear() + '-' + (date.getMonth() + 1) 
				   + '-' + date.getDate() + ' ' + date.getHours() + ':' 
				   + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : 
				   date.getMinutes()) + ":" + (date.getSeconds() < 10 ? 
				   ('0' + date.getSeconds()) : date.getSeconds());

  		return time;
	}

	//发话
	$('#say').click(function(){
		//获取要发送的信息
		var $msg = $('#input_content').val();
		if ($msg == "") return;
		//把要发送的信息先添加到自己的浏览器DOM中
		if (to == "all") {
			$("#contents").append('<div class="message_box_self clearfix"><img class="photo_img" alt="' 
				+ from + '" src="images/' + photo + '.jpg' 
				+ '"><div class="text_box"><p class="user_name"></p><p class="text">' 
				+ $msg + '</p></div></div><br/>');
		} else {
			$("#contents").append('<div class="message_box_self clearfix"><img class="photo_img" alt="' 
				+ from + '" src="images/' + photo + '.jpg' 
				+ '"><div class="text_box"><p class="user_name">你对' + to 
				+ '说</p><p class="text spec">' + $msg + '</p></div></div><br/>');
		}
		//发送发话信息
		socket.emit('say', {from: from, to: to, msg: $msg, photo: photo});
		//清空输入框并获得焦点
		$('#input_content').val("").attr('placeholder', '').focus();
		to = 'all'; 
		//内容自动滚动到最下方
		$('#content_show').scrollTop($('#contents').height() - $('#content_show').height());
	});

	//输入框获得焦点事件
	$('#input_content').focus(function(event) {
		event.preventDefault();
		$(this).animate({
			height: '100px'
		}, 100);
		$('#content_show').animate({
			height: '426px'
		}, 100, function() {
			$('#content_show').css('overflow-y', 'scroll');
			//内容自动滚动到最下方
			$('#content_show').scrollTop($('#contents').height() - $('#content_show').height());
		});
	});

	//输入框焦点失去事件
	var $input_content = $('#input_content');
	$('#contain').on('click', '#users_online, #content_show', function(event) {
		$input_content.animate({
			height: '24px'
		}, 100);
		$('#content_show').animate({
			height: '502px'
		}, 100, function() {
			$('#content_show').css('overflow-y', 'scroll');
		});
	});

	//回车发送事件
	$('#input_content').keydown(function(event) {
		if(event && event.keyCode === 13) {
			$('#say').trigger('click');
			$(this).blur();
		}
	})
	/*$('document').on('keydown', '#input_content', function(event) {
		alert('haha');
		if(event && event.keyCode === 13) {
			alert('srue!');
			$('#say').trigger('click');
		}
	})*/
});