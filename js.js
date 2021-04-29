// Verificando a Janela
if(window.addEventListener) {
	window.addEventListener('load', function () {
		var canvas, contexto, canvas_objeto, contexto_objeto;
		
		// Instancia de uma ferramenta. Inicia com a padrão
		var ferramenta;
		var ferramenta_padrao = 'circle';
		
		function init () {
			// Buscando o elemento canvas
			canvas_objeto = document.getElementById('imageView');
			if (!canvas_objeto) {
				alert('Erro: Impossivel encontrar o elemento canvas!');
				return;
			}
			
			if (!canvas_objeto.getContext) {
				alert('Erro: Canvas.getContext ausente!');
				return;
			}
			
			// Pegando o contexto canvas 2D.
			contexto_objeto = canvas_objeto.getContext('2d');
			if (!contexto_objeto) {
				alert('Erro: Falha ao pegar o contexto canvas!');
				return;
			}
			
			// Criando um container canvas temporario.
			var container = canvas_objeto.parentNode;
			canvas = document.createElement('canvas');
			if (!canvas) {
				alert('Erro: Não foi possivel criar um Novo elemento canvas!');
				return;
			}
			
			canvas.id     = 'imageTemp';
			canvas.width  = canvas_objeto.width;
			canvas.height = canvas_objeto.height;
			container.appendChild(canvas);
			
			contexto = canvas.getContext('2d');
			
			// Recuperando a ferramenta escolhida no input de selecao
			var tool_select = document.getElementById('dtool');
			
			
			// Capturando os clicks dos botoes
			var $divButton = document.querySelector('.divButton');
			var botoes = $divButton.getElementsByTagName("button");
			for(var i=0; i<botoes.length; i++){
				botoes[i].addEventListener('click', function(){
					var title = this.getAttribute('title');
					ferramenta = new tools[title]();
				})
			}
			
			
			if (!tool_select) {
				alert('Error: Falha ao recuperar ferramenta selecionada!');
				return;
			}
			tool_select.addEventListener('change', ev_tool_change, false);
			
			// Ativando a ferramenta padrao.
			if (tools[ferramenta_padrao]) {
				ferramenta = new tools[ferramenta_padrao]();
				tool_select.value = ferramenta_padrao;
			}
			
			// Adicionando ao canvas os ouvintes de eventos: mousedown, mousemove e mouseup.
			canvas.addEventListener('mousedown', ev_canvas, false);
			canvas.addEventListener('mousemove', ev_canvas, false);
			canvas.addEventListener('mouseup',   ev_canvas, false);
		}
		
		// Manipulador de evntos gerais. Determina somente os eventos do mouse
		// Posicao relativa ao elemento canvas.
		function ev_canvas (ev) {
			if (ev.layerX || ev.layerY == 0) { // Firefox
				ev._x = ev.layerX;
				ev._y = ev.layerY;
			} 
			
			// Chama o manipulador de eventos da ferramenta.
			var func = ferramenta[ev.type];
			if (func) {
				func(ev);
			}
		}
		
		// Manipulador de eventos para quaisquer alterações feitas no seletor de ferramenta
		function ev_tool_change (ev) {
			if (tools[this.value]) {
				ferramenta = new tools[this.value]();
			}
		}
		
		// Esta função desenha a tela #imageTemp sobre o #imageView, após isso o #imageTemp é limpo. 
		// Essa função é chamada sempre que o usuário completa uma operação de desenho
		function img_update () {
			contexto_objeto.drawImage(canvas, 0, 0);
			contexto.clearRect(0, 0, canvas.width, canvas.height);
		}
		
		// Esta variavel contem a implementacao de cada uma das ferramentas de desenho
		var tools = {};
		
		// O Pincel de Desenho.
		tools.pencil = function () {
			var ferramenta = this;
			this.started = false;
			
			// Isto eh chamado quando o usuario comeca a precionar o botao do mouse
			// Isso inicia o desenho a picel
			this.mousedown = function (ev) {
				contexto.beginPath();
				contexto.moveTo(ev._x, ev._y);
				ferramenta.started = true;
			};
			
			// Essa funcao eh chamada toda vez que o usuario move o mouse.
			// Obviamente, apenas se o  estado da variavel ferramenta.started for true 
			// Este ultimo passo ocorre sempre que o usuario move o mouse.
			this.mousemove = function (ev) {
				if (ferramenta.started) {
					contexto.lineTo(ev._x, ev._y);
					contexto.stroke();
				}
			};
			
			// Isso eh chamado quando o usuario solta o botao do mouse
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
				}
			};
		};
		
		// A Ferramenta Retangulo
		tools.rect = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!ferramenta.started) {
					return;
				}
				
				var x = Math.min(ev._x,  ferramenta.x0),
				y = Math.min(ev._y,  ferramenta.y0),
				w = Math.abs(ev._x - ferramenta.x0),
				h = Math.abs(ev._y - ferramenta.y0);
				
				contexto.clearRect(0, 0, canvas.width, canvas.height);
				
				if (!w || !h) {
					return;
				}
				
				contexto.strokeRect(x, y, w, h);
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
				}
			};
		};
		
		// A ferramenta Linha reta
		tools.line = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!ferramenta.started) {
					return;
				}
				
				contexto.clearRect(0, 0, canvas.width, canvas.height);
				
				contexto.beginPath();
				contexto.moveTo(ferramenta.x0, ferramenta.y0);
				contexto.lineTo(ev._x,   ev._y);
				contexto.stroke();
				contexto.closePath();
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
				}
			};
		};
		
		// Ferramenta Circulo
		tools.circle = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!ferramenta.started) {
					return;
				}
				
				var center_x = Math.abs((ev._x - ferramenta.x0) / 2),
				center_y = Math.abs((ev._y - ferramenta.y0) / 2),
				radius = (ev._y - ferramenta.y0) / 2,
				start_angle = 0
				end_angle = 2 * Math.PI;
				
				contexto.clearRect(0, 0, canvas.width, canvas.height);
				
				if (!center_x || !center_y) {
					return;
				}
				contexto.beginPath();
				contexto.arc(ev._x, ev._y, radius, start_angle, end_angle);
				contexto.stroke();
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
				}
			};
		};
		
		// A ferramenta Ponto
		tools.point = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
				
				contexto.beginPath();
				contexto.fillRect(ferramenta.x0, ferramenta.y0, 4, 4);
				contexto.stroke();
				contexto.closePath();
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();

		document.getElementById("coordenadas_ponto").innerHTML = "<b> Coordenadas X e Y do Ponto </b>";
        document.getElementById("x_ponto").innerHTML = "<b>Coordenadas X: </b> </br>"+ferramenta.x0;
        document.getElementById("y_ponto").innerHTML = "<b>Coordenadas Y: </b> </br>"+ferramenta.y0;
				}
			};
		};
		
		// A ferramenta Curva Bezier
		tools.bezier = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!ferramenta.started) {
					return;
				}
				
				contexto.clearRect(0, 0, canvas.width, canvas.height);
				
				contexto.beginPath();
				contexto.moveTo(ferramenta.x0, ferramenta.y0);
				contexto.bezierCurveTo(10, 10, 20, 20, ev._x, ev._y);
				contexto.stroke();
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
				}
			};
		};
		
		
		// Ferramenta Poligono
		tools.polygon = function () {
			var ferramenta = this;
			this.started = false;
			
			this.mousedown = function (ev) {
				ferramenta.started = true;
				ferramenta.x0 = ev._x;
				ferramenta.y0 = ev._y;
			};
			
			this.mousemove = function (ev) {
				if (!ferramenta.started) {
					return;
				}
				
				// Guarda as primeiras cordenadas do poligono  
				coordenadas_X = new Array();
				coordenadas_Y = new Array();
				
				// Recupera a entrada do usuario para o poligono
				var radius = Math.abs(ev._y - ferramenta.y0) / 2;
				var edge = document.getElementById('edge').value;
				// Recupera o ponto central das coordenadas onde o polygono será localizado
				var xCenter = parseInt(ev._x - ferramenta.x0 / 2);
				var yCenter = parseInt(ev._y - ferramenta.y0 / 2);
				// Limpa o canvas
				contexto.clearRect(0, 0, canvas.width, canvas.height);
				// Inicia o Path
				contexto.beginPath();
				// Mapeia o primeiro vertice para iniciar o desenho
				var xPos = xCenter + radius * Math.cos(2 * Math.PI * 0 / edge);
				var yPos = yCenter + radius * Math.sin(2 * Math.PI * 0 / edge);
				contexto.moveTo(xPos, yPos);
				
				coordenadas_X[0] = xPos;
				coordenadas_Y[0] = xPos;
				
				// Loop que passa pelos vertices e mapeia as linhas
				for (i = 1; i <= edge; i++) {
					// Determina as coordenadas do proximo vertice
					xPos = xCenter + radius * Math.cos(2 * Math.PI * i / edge);
					yPos = yCenter + radius * Math.sin(2 * Math.PI * i / edge);
					// Seta a linha para o proximo vertice
					contexto.lineTo(xPos, yPos);
					// Guarda as demais cordenadas do poligono
					coordenadas_X[i] = xPos;
					coordenadas_Y[i] = yPos;
				}
				// Fecha o caminho percorrido pelas linhas
				contexto.closePath();
				contexto.lineJoin = 'round';
				contexto.stroke();
				// contexto.fill();
			};
			
			this.mouseup = function (ev) {
				if (ferramenta.started) {
					ferramenta.mousemove(ev);
					ferramenta.started = false;
					img_update();
					
		document.getElementById("coordenadas_poligono").innerHTML = "<b> Coordenadas Para X e Y  com "+edge.value+" vertices : </b>";
        document.getElementById("x_poligono").innerHTML = "<b>Coordenadas X: </b> </br>"+coordenadas_X;
        document.getElementById("y_poligono").innerHTML = "<b>Coordenadas Y: </b> </br>"+coordenadas_Y;
					
				}
			};
		};
		
		init();
		
	}, false); }
	