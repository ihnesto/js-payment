
let obj  = {};

function getTemplate(name) {
	// Получение шаблона страницы
	$.ajax({
		url: '/get_templates/' + name,
		success: function(data) {
			$('.container').append(data);
			if(name == 'phone.html') {
				$('#phone').mask('+38(000) 000-00-00');
				$('#sum').mask('000,00'); 
				getPackets();
			} else {
				check2();
			}		
		}
	});
}

function getPackets() {
	// Получение списка пакетов оплаты
	$.ajax({
		url: '/get_packets',
		success: function(pack) {
			for(let i = pack.packets.length - 1; i >= 0 ; i--) {
				 let packetItem = $('<div>').html(pack.packets[i]).addClass('btn btn-outline-info mr-2 my-3');
				$('.packets').append(packetItem);
			}
			$('.sum').click(function() {
				let value = $(this).text();
				for(var i = 1; i <= value; i++){
					$('.sum').css('border', '1px solid grey');
				}
				$(this).css('border', '2px solid black'); 
				
				$('.sum2').val(value);
			});
			check();
		}
	});
}

function check() {
	// Проверка заполненности полей форм первой страницы
	let p = true;
	$('#more').click(function() {
		
		var errors = '';
		let endSum = $('#sum').val();
		
		if (endSum.length == 0) {
			$('.sum2').css("border", "2px solid red"); 
			p = false;
			
		} else {
			$('.sum2').css("border", "1px solid lightgrey");
		} 
		
		
		let telNumber = $('#phone').val();
		let telPrefix = $('.pref').val();
		var telephone = '(' + telPrefix + ')' + telNumber;
		if(telNumber.length == 0) {
			$('#tel').css("border", "2px solid red"); 
			p = false;
		} else {
			$('#tel').css("border", "1px solid lightgrey"); 
		}
		
		
		
		if (p != false) {
		
			obj.sum = endSum;
			obj.telephone = telephone;
			console.log(obj);
			$(".container").html('');	
			getTemplate('card.html');	
			
		}	
	});
}
	
		

function check2(){
	// Проверка заполненности полей форм второй страницы		
	$('#NumCard').mask('0000 0000 0000 0000');
	$('#CVV2').mask('000');	
	$('.checkout').click(function() {
		var p = true;
		var card = $('#NumCard').val();
		if(card.length == 0) {
			$('#NumCard').css("border", "2px solid red"); 
			p = false;
		} else {
			var newCard = '';
			for(var i=0; i < card.length; i++){
				if(card[i] !=' '){
					newCard += card[i]; 
				}
			}
			newCard = newCard.split(''); 
			var s = 0;
			for(var i = 0; i < newCard.length; i++){
				if(i % 2 == 0) {
					newCard[i] = newCard[i]*2;
				}
				if (newCard[i] > 9) {
					newCard[i] = newCard[i] - 9;
				}
				s = s + +newCard[i];	
			}
			if (s % 10 != 0) {
				$('#NumCard').css("border", "2px solid red"); 
				p = false;
			} else {
				$('#NumCard').css("border", "1px solid lightgrey"); 
			}
		}
		
		var tday = new Date();
		var year = tday.getFullYear();
		var yearCard = $('#year').val();
		if(yearCard < year) {
			$('#year').css("border", "2px solid red");
			p = false;	
		} else {
			if(yearCard == year) {
				var month = tday.getMonth() + 1;
				var monthCard = $('#month').val();
				if(monthCard < month) {
					$('#month').css("border", "2px solid red");
					p = false;
				} else {
					$('#month').css("border", "1px solid lightgrey"); 
				}
			}
		}
		var exp = monthCard + '/' + yearCard;
						
		var CVV = $('#CVV2').val();
		if(CVV.length != 3) {
			$('#CVV2').css("border", "2px solid red"); 
			p = false;
		} else {
			$('#CVV2').css("border", "1px solid lightgrey"); 
		}
		if (p != false) {
			obj.cardNumber = card;
			obj.expDate = exp;
			obj.cvv = CVV;
			console.log(obj);
			sendPayment(obj);
		}
	});
}
		
function sendPayment(paymentObject) {
	// Отправка данных платежа на сайт
	let payString = JSON.stringify(paymentObject);
	$.ajax({
		url: '/save_payment',
		method: 'post',
		data: payString,
		contentType: 'application/json; charset=UTF-8',
		success: function(d) {
			$('div').html('Payment is complete'); 	
		},
		error: function(e) {
			console.log(e);
		}
	});
}
		
// Запуск приложения
getTemplate('phone.html');
