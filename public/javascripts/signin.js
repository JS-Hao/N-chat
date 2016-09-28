$(document).ready(function() {
	//随机设置头像
	var num = Math.ceil(Math.random() * 10);
	$('.logo img').attr({
		'src': 'images/' + num + '.jpg',
		'num': num
	});
	$('.photo').val(num);
	//点击头像将随机替换头像
	$('.logo img').on('click', function() {
		var num = parseInt($(this).attr('num')) + 1;
		if (num > 10) {
			num = 1;
		}
		$(this).attr({
			'src': 'images/' + num + '.jpg',
			'num': num
		});
		$('.photo').val(num);
	});

});