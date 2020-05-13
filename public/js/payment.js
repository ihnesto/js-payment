
let obj  = {};

function getTemplate(name) {
	// Получение шаблона страницы
	$.ajax({
		url: '/get_templates/' + name,
		success: function(data) {
			// вставляем полученный файл в index.html 
			$('.container').append(data);
			if(name == 'phone.html') {
				// накладываем маски на поля ввода
				$('#phone').mask('+38(000) 000-00-00');
				$('#sum').mask('0000'); 
				// получаем сцммы оплаты и переход на проверку полей первой страницы
				getPackets();
			} else {
				// переход на проверку полей второй страницы
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
			// рисуем типовые суммы оплаты
			for(let i = pack.packets.length - 1; i >= 0 ; i--) {
				let packetItem = $('<div>').html(pack.packets[i]).addClass('btn btn-outline-info mr-2 my-3');
				$('.packets').append(packetItem);
			}
			// вешаем событие click на типовые суммы оплаты
			$('.packets .btn').click(function() {
				let value = $(this).text();
				$('#sum').val(value);
			});
			// переход на проверку полей ввода первой страницы
			check();
		}
	});
}

function check() {
	// Проверка заполненности полей форм первой страницы
	$('#more').click(function() {
		let p = true;
		// проверяем поле суммы
		let endSum = $('#sum').val();
		if (endSum.length == 0 || parseInt(endSum) == 0) {
			$('#sum').addClass('is-invalid').removeClass('is-valid'); 
			p = false;	
		} else {
			$('#sum').addClass('is-valid').removeClass('is-invalid');
		} 
		// проверяем поле номера телефона
		let telNumber = $('#phone').val();
		if(telNumber.length != 18)  {
			$('#phone').addClass('is-invalid').removeClass('is-valid'); 
			p = false;
		} else {
			$('#phone').addClass('is-valid').removeClass('is-invalid'); 
		}
		// если ошибок нет
		if (p != false) {
			obj.sum = endSum;
			obj.telephone = telNumber;
			console.log(obj);
			// то загружаем вторую страницу
			$(".container").html('');	
			getTemplate('card.html');	
			
		}	
	});
}
	
function check2(){
	// Проверка заполненности полей форм второй страницы	
	// вешаем маски на поля ввода	
	$('#card').mask('0000 0000 0000 0000');
	$('#cvv').mask('000');	
	$('#expdate').mask('00/00');	
	$('#pay').click(function() {
		let p = true;
		// проверяем пле ввода номера карты
		let card = $('#card').val();
		if(card.length != 19) {
			$('#card').addClass('is-invalid').removeClass('is-valid'); 
			p = false;
		} else {
			// проверяем номер по алгоритму Луна
			let newCard = '';
			for(let i=0; i < card.length; i++){
				if(card[i] !=' '){
					newCard += card[i]; 
				}
			}
			newCard = newCard.split(''); 
			let s = 0;
			for(let i = 0; i < newCard.length; i++){
				if(i % 2 == 0) {
					newCard[i] = newCard[i]*2;
				}
				if (newCard[i] > 9) {
					newCard[i] = newCard[i] - 9;
				}
				s = s + +newCard[i];	
			}
			// если кратно десяти
			if (s % 10 != 0) {
				$('#card').addClass('is-invalid').removeClass('is-valid'); 
				p = false;
			} else {
				$('#card').addClass('is-valid').removeClass('is-invalid'); 
			}
		}
		// проверям поле даты окончания действия карты
		let expired = 0;
		let now = new Date();
		let year = now.getFullYear();
		let month = now.getMonth() + 1;
		let expDate = $('#expdate').val();
		if (expDate.length != 5) {
			$('#expdate').addClass('is-invalid').removeClass('is-valid'); 
			p = false;
		} else {
			let cardMonth = +expDate.slice(0, 2);
			let cardYear = +('20' + expDate.slice(3));
			// если год меньше текущего
			if (cardYear < year) {
					$('#expdate').addClass('is-invalid').removeClass('is-valid'); 
					p = false;	
			} else {
				$('#expdate').addClass('is-valid').removeClass('is-invalid'); 
				if (cardYear == year) {
					// если месяц меньше текущего
					if( cardMonth > 12 || cardMonth < month) {
						$('#expdate').addClass('is-invalid').removeClass('is-valid'); 
						p = false;
					} else {
						$('#expdate').addClass('is-valid').removeClass('is-invalid'); 
					}
				} else {
					
				}
			}
			if (cardMonth.length != 2)
				cardMonth = '0' + cardMonth;
			expired = cardMonth + '/' + cardYear;
		}
		// проверка заполненности поля cvv-кода				
		let cvv = $('#cvv').val();
		if(cvv.length != 3) {
			$('#cvv').addClass('is-invalid').removeClass('is-valid');  
			p = false;
		} else {
			$('#cvv').addClass('is-valid').removeClass('is-invalid'); 
		}
		// проверка заполненности поля имени плательщика
		let cardHoldername = $('#name').val();
		if(cardHoldername.length == 0) {
			$('#name').addClass('is-invalid').removeClass('is-valid');  
			p = false;
		} else {
			$('#name').addClass('is-valid').removeClass('is-invalid'); 
		}
		// если ошибок нет
		if (p != false) {
			obj.cardNumber = card;
			obj.expDate = expired;
			obj.cvv = cvv;
			console.log(obj);
			// то отправляем данные платежа на сайт
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
			$('div').html('Payment is completed'); 	
		},
		error: function(e) {
			console.log(e);
		}
	});
}
		
// Запуск приложения
getTemplate('phone.html');
