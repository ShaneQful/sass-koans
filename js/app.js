'use strict';
/*global Sass*/

(function () {
	var sass = new Sass();

	function getJSON(success, failure) {
		var request = new XMLHttpRequest();
		request.open('GET', 'json/meditations.json', true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				success(JSON.parse(request.responseText));
			} else {
				failure();
			}
		};

		request.onerror = failure;

		request.send();
	}



	function ready(fn) {
		if (document.readyState != 'loading'){
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	ready(function () {
		getJSON(function (meditations) {
			var state = {
				current: {
					meditation: 0,
					koan: 0
				}
			};
			function render() {
				var meditation = meditations[state.current.meditation],
					koan = meditation.koans[state.current.koan];
				document.querySelector('.meditation').innerHTML = meditation.name;
				document.querySelector('.koan').innerHTML = koan.koan;
				document.querySelector('.css').innerHTML = koan.css.replace(/\n/g, '<br>');
				document.querySelector('.sass').innerHTML = koan.sass.replace('__', '<input class="blank" type="text" autofocus="true" />').replace(/\n/g, '<br>');
			}

			function attachEvents() {
				var nodes = document.querySelectorAll('.blank');
				nodes[0].addEventListener('change', function (event) {
					var meditation = meditations[state.current.meditation],
						koan = meditation.koans[state.current.koan],
						solution = koan.sass.replace('__', event.target.value);
					sass.compile(solution, function(result) {
						if(result.status === 1) {
							alert(result.message);
						} else if(result.text == null) {
							alert('This isn\'t valid sass');
						} else if(result.text.replace(/\s/g, '') === koan.css.replace(/\s/g, '')) {
							if(state.current.koan < meditation.koans.length - 1) {
								state.current.koan += 1;
							} else {
								if(state.current.meditation < meditations.length - 1) {
									state.current.meditation += 1;
									state.current.koan = 0;
								} else {
									alert('Congratulations you\'ve attained sass enlightenment !');
								}
							}
							render();
							attachEvents();
						} else {
							alert('Compiled sass doesn\'t match the css');
						}
					});
				});
			}

			render();
			attachEvents();
		});
	});
}());
