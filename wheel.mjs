var formEditor = document.querySelector("#graph-editor");
const dataset = getParam('dataset');
var chartProps = {};
var canvasShow = document.querySelector("#canvas-show");
var canvasOut = document.querySelector("#canvas-out");
var imgData = canvasOut.toDataURL(); // por padrão, a imagem é PNG
var fontFamily = "Roboto";

var chartValues = {
  fontTitle: "0px " + fontFamily,
  startAngle: -0.5 * Math.PI,
  currentAngle: -0.5 * Math.PI,
  sliceAngle: (1 / 20) * 2 * Math.PI,
  centerX: 0,
  centerY: 0,
  sizeControl: 0,
  height: 0,
  width: 0,
};


// Ajusta tamanho do canvas
function canvaSize() {
  var currentDate = new Date();
  var newWidth = window.innerWidth - document.getElementById("sidebar").offsetWidth - 60;
  if (window.innerHeight - 130 < newWidth) {
    newWidth = window.innerHeight - 130;
  }
  document.getElementById("canvas-show").width = newWidth;
  formEditor.querySelector("input[name=date]").value =
    currentDate.getFullYear() +
    "-" +
    (currentDate.getMonth() < 9
      ? "0" + (currentDate.getMonth() + 1)
      : currentDate.getMonth()) +
    "-" +
    (currentDate.getDate() < 10
      ? "0" + currentDate.getDate()
      : currentDate.getDate());
}

function getParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

async function getData(dataset) {
  const url = `https://raw.githubusercontent.com/btfonseca1905/roda-produto/refs/heads/main/dataset/${dataset}.json`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

function makeForm(chartProps) {
  document
    .querySelectorAll(".group-accordion")
    .forEach((item) => item.remove());

  let groupId = 0;
  let itemId = 0;
  for (const group of chartProps.groups) {
    const accordDiv = document.createElement("div");
    const headerH2 = document.createElement("h2");
    const titleButton = document.createElement("button");
    const collapseDiv = document.createElement("div");
    const bodyDiv = document.createElement("div");
    const addButtonRow = document.createElement("div");
    const addButton = document.createElement("button");

    // Accordion
    accordDiv.className = "accordion-item group-accordion";
    // Accordion header
    headerH2.className = "accordion-header";
    headerH2.append(titleButton);

    // Accordion title
    titleButton.innerHTML = group.title;
    titleButton.className = "accordion-button";
    titleButton.setAttribute("type", "button");
    titleButton.setAttribute("data-bs-toggle", "collapse");
    titleButton.setAttribute("data-bs-target", "#groupsAccord");
    titleButton.setAttribute("aria-expanded", "true");
    titleButton.setAttribute("aria-controls", "groupsAccord");

    // Body
    collapseDiv.id = "groupsAccord";
    collapseDiv.className = "accordion-collapse collapsed collapse show";
    collapseDiv.append(bodyDiv);
    bodyDiv.className = "accordion-body";

    for (const itemPos in group.itens) {
      const item = group.itens[itemPos];
      const itemDiv = document.createElement("div");
      const inputGroupSpan = document.createElement("input");
      const itemInput = document.createElement("input");

      // Item
      itemDiv.className = "input-group input-group-sm row";

      // Span
      inputGroupSpan.className = "input-group-text col-sm-10";
      inputGroupSpan.name = "t" + itemId;
      inputGroupSpan.setAttribute("type", "text");
      inputGroupSpan.setAttribute("value", item.title);

      itemInput.className = "form-control col-sm-2";
      itemInput.name = "" + itemId;
      itemInput.setAttribute("type", "number");
      itemInput.setAttribute("min", "-1");
      itemInput.setAttribute("max", "5");
      itemInput.setAttribute("group-pos", "" + groupId);
      itemInput.setAttribute("item-pos", "" + itemPos);
      itemInput.setAttribute("value", item.value);
      itemInput.addEventListener("click", setItemValue);

      itemDiv.append(inputGroupSpan);
      itemDiv.append(itemInput);

      bodyDiv.append(itemDiv);
      itemId++;
    }

    // Add button
    addButtonRow.className = "row";

    addButton.innerHTML = "+";
    addButton.className = "btn btn-sm offset-sm-10 col-sm-1";
    addButton.setAttribute("type", "button");
    addButton.setAttribute("group-pos", "" + groupId);
    addButton.addEventListener("click", addGroupItem);

    bodyDiv.append(addButtonRow);
    addButtonRow.append(addButton);

    accordDiv.append(headerH2);
    accordDiv.append(collapseDiv);

    formEditor.append(accordDiv);
    groupId++;
  }
}

function loadFormValues() {
  chartProps.drawborder = false;
  chartProps.time =
    formEditor.querySelector("input[name=time]")?.value || "";
  chartProps.date =
    formEditor.querySelector("input[name=date]")?.value || "";

  chartProps.showTitle =
    formEditor.querySelector("input[name=showTitle]")?.checked;
  chartProps.showDate =
    formEditor.querySelector("input[name=showDate]")?.checked;
  chartProps.showSubtitles =
    formEditor.querySelector("input[name=showSubtitles]")?.checked;

  chartProps.colors.text =
    formEditor.querySelector("input[id=texto]")?.value || "";
  chartProps.colors.min =
    formEditor.querySelector("input[id=cor_menor]")?.value || "";
  chartProps.colors.med =
    formEditor.querySelector("input[id=cor_media]")?.value || "";
  chartProps.colors.max =
    formEditor.querySelector("input[id=cor_maior]")?.value || "";

  for (var i = 0; i < 100; i++) {
    var inputTitle = formEditor.querySelector('input[name="t' + i + '"]');
    var input = formEditor.querySelector('input[name="' + i + '"]');

    if (inputTitle && input) {
      if (!chartProps.itens[i]) {
        chartProps.itens[i] = {};
      }
      chartProps.itens[i].title = inputTitle ? inputTitle.value : "";
      chartProps.itens[i].value = input ? input.value : "";
    }
  }
}

function setItemValue() {
  if (this.value === '-1') {
    if (confirm("Deseja remover este item da lista?")) {
      var groupPos = parseInt(this.getAttribute("group-pos"));
      var itemPos = parseInt(this.getAttribute("item-pos"));
      chartProps.groups[groupPos].itens.splice(itemPos, 1);

      chartProps.itens = [];

      makeForm(chartProps);
      loadFormValues();
      draw(canvasShow, chartProps);
    } else {
      this.value = '0';
    }
  }
}

function addGroupItem() {
  var groupPos = parseInt(this.getAttribute("group-pos"));
  chartProps.groups[groupPos].itens.push({
    title: "",
    value: 1
  })
  chartProps.itens = [];

  makeForm(chartProps);
  loadFormValues();
  draw(canvasShow, chartProps);
}

//
function loadProps(chartProps) {
  chartProps.itens = chartProps.groups.map((curr) => curr.itens).flat();
}

function configureChart(canvas, chartProps) {
  chartValues.sliceAngle = (1 / chartProps.itens.length) * 2 * Math.PI;

  chartValues.centerX = canvas.width / 2;
  canvas.height = canvas.width * 1.05;
  chartValues.centerY = canvas.height / 1.92;
  chartValues.sizeControl = 0.082 * canvas.width;

  chartValues.width = canvas.width;
  chartValues.height = canvas.height;

  chartValues.fontTitle = 0.03125 * chartValues.width + "px " + fontFamily;
  chartValues.fontSubtitle = 0.015 * chartValues.width + "px " + fontFamily;
}

function makeScorePath(centerX, centerY, radius, startAngle, endAngle) {
  var path = new Path2D();
  path.arc(centerX, centerY, radius, startAngle, endAngle);
  path.lineTo(centerX, centerY);

  return path;
}

function drawBorder(cx, width, height) {
  cx.fillStyle = "white";
  cx.strokeStyle = chartProps.colors.text;

  cx.fillRect(0, 0, width, height);
  cx.rect(0, 0, width, height);
  if (chartProps.drawborder) {
    cx.stroke();
  }
}

function drawScore(cx) {
  var path;
  var colors = [
    chartProps.colors.min,
    chartProps.colors.min,
    chartProps.colors.med,
    chartProps.colors.max,
    chartProps.colors.max,
  ];

  for (var i = 5; i > 0; i--) {
    chartProps.itens.forEach(function (result) {
      if (result.value > 5) result.value = 5;
      if (result.value < 1) result.value = 1;

      cx.fillStyle = result.value >= i ? colors[result.value - 1] : "white";
      cx.strokeStyle = chartProps.colors.text;
      cx.lineWidth = 0.2;

      path = makeScorePath(
        chartValues.centerX,
        chartValues.centerY,
        chartValues.sizeControl * i,
        chartValues.currentAngle,
        chartValues.currentAngle + chartValues.sliceAngle
      );

      cx.fill(path);
      cx.stroke(path);

      chartValues.currentAngle += chartValues.sliceAngle;
    });
  }
}

function drawLines(cx, chartProps) {
  var count = 0;
  var totalItens = 0
  chartProps.groups.forEach(function (group) {
    totalItens += group.itens.length;
    group.itens.forEach(function (item) {
      if (count == totalItens - 1) {
        var lineWidth = 4;
      } else {
        var lineWidth = 1;
      }

      cx.beginPath();
      cx.strokeStyle = chartProps.colors.text;

      cx.arc(
        chartValues.centerX,
        chartValues.centerY,
        chartValues.sizeControl * 6,
        chartValues.currentAngle,
        chartValues.currentAngle + chartValues.sliceAngle,
        true
      );
      chartValues.currentAngle += chartValues.sliceAngle;
      cx.lineTo(chartValues.centerX, chartValues.centerY);
      cx.lineWidth = lineWidth;
      cx.stroke();

      count++;
    });
  });

  chartProps.itens.forEach(function (result) {
    cx.beginPath();
    cx.strokeStyle = "white";

    cx.arc(
      chartValues.centerX,
      chartValues.centerY,
      chartValues.sizeControl * 6,
      chartValues.currentAngle,
      chartValues.currentAngle + chartValues.sliceAngle,
      true
    );
    chartValues.currentAngle += chartValues.sliceAngle;
    cx.lineWidth = 10;
    cx.stroke();
    cx.closePath();
  });
}

function drawHeaders(cx, chartProps) {
  const { width, height } = chartValues;
  chartValues;

  // Textos do gráfico
  cx.font = chartValues.fontTitle;
  cx.fillStyle = chartProps.colors.text;

  if (chartProps.showTitle) {
    cx.fillText(
      chartProps.time || "Informe um título",
      width * 0.0125,
      height * 0.038461538461538464
    );
  }

  if (chartProps.showDate) {
    cx.fillText(chartProps.date, width * 0.821, height * 0.038461538461538464);
  }

  var heightTitle = height * 0.10230769230769231;
  var heightSubTitle = height * 0.12330769230769231;

  if (chartProps.showSubtitles) {
    if (chartProps.groups.length > 0) {
      cx.font = chartValues.fontTitle;
      cx.fillText(chartProps.groups[0].title, width * 0.0125, heightTitle);
      cx.font = chartValues.fontSubtitle;
      cx.fillText(
        chartProps.groups[0].subtitle,
        width * 0.0125,
        heightSubTitle
      );
    }

    if (chartProps.groups.length > 1) {
      cx.font = chartValues.fontTitle;
      cx.fillText(chartProps.groups[1].title, width * 0.865, heightTitle);
      cx.font = chartValues.fontSubtitle;
      cx.fillText(chartProps.groups[1].subtitle, width * 0.895, heightSubTitle);
    }

    heightTitle = height * 0.9569230769230769;
    heightSubTitle = height * 0.9769230769230769;

    if (chartProps.groups.length > 2) {
      cx.font = chartValues.fontTitle;
      cx.fillText(chartProps.groups[2].title, width * 0.81, heightTitle);
      cx.font = chartValues.fontSubtitle;
      cx.fillText(
        chartProps.groups[2].subtitle,
        width * 0.87125,
        heightSubTitle
      );
    }

    if (chartProps.groups.length > 3) {
      cx.font = chartValues.fontTitle;
      cx.fillText(chartProps.groups[3].title, width * 0.0125, heightTitle);
      cx.font = chartValues.fontSubtitle;
      cx.fillText(
        chartProps.groups[3].subtitle,
        width * 0.0125,
        heightSubTitle
      );
    }
  }
}

function splitText(txt) {
  return txt.split(" ").reduce(
    (last, curr, idx) => {
      const size = last[last.length - 1].length + curr.length;
      if (!idx || size < 17) {
        last[last.length - 1] += " " + curr;
      } else {
        last.push(curr);
      }
      return last;
    },
    [""]
  );
}

function drawTitles(cx, chartProps) {
  // Cultura
  cx.font = 0.015 * chartValues.width + "px " + fontFamily;
  cx.fillStyle = chartProps.colors.text;

  for (var key in chartProps.itens) {
    var item = chartProps.itens[key];
    const titles = splitText(item.title);

    for (var keyTxt in titles) {
      const title = titles[keyTxt];
      cx.save();

      var angle =
        key * chartValues.sliceAngle +
        Math.PI * 1.5 +
        chartValues.sliceAngle * 0.02 +
        keyTxt * 0.005;
      var distance =
        chartValues.width * 0.47 - chartValues.width * keyTxt * 0.02;
      var x = distance * Math.cos(angle);
      var y = distance * Math.sin(angle);

      cx.translate(x + chartValues.centerX, y + chartValues.centerY);
      cx.rotate(angle + Math.PI / 1.85);

      cx.fillText(title, 0, 0);

      cx.restore();
    }
  }
}

function bindClick(canvasEl, chartProps) {
  if (!canvasEl.bindedClick) {
    canvasEl.bindedClick = true;

    var cLeft = canvasEl.offsetLeft + canvasEl.clientLeft;
    var cTop = canvasEl.offsetTop + canvasEl.clientTop;

    canvasEl.addEventListener("click", function (event) {
      var x = event.pageX - cLeft,
        y = event.pageY - cTop;

      var delta_x = x - chartValues.centerX;
      var delta_y = y - chartValues.centerY;
      var theta_radians = Math.atan2(delta_y, delta_x);
      var distanceEuc = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
      var slice = (chartValues.width * 0.82) / 2 / 5;
      var value = Math.ceil(distanceEuc / slice);

      if (value < 6) {
        var idx = Math.floor(
          (theta_radians + Math.PI + Math.PI * 1.5) / chartValues.sliceAngle
        );
        idx = idx % chartProps.itens.length;

        chartProps.itens[idx].value = value;

        makeForm(chartProps);
        draw(canvasEl, chartProps);
      }
    });
  }
}

function draw(canvas, props) {
  var cx = canvas.getContext("2d");
  cx.save();

  loadProps(props);
  configureChart(canvas, props);
  drawBorder(cx, canvas.width, canvas.height);
  drawScore(cx);
  drawLines(cx, props);

  drawHeaders(cx, props);
  drawTitles(cx, props);

  imgData = canvas.toDataURL();

  cx.restore();

  bindClick(canvas, props);
}
function navBar(dataset){
  const title = dataset == 'product'? 'Product Manager Wheel': 'Marketing Wheel';
  document.getElementById("title-wheel").innerText = title;
}
//pipe executions
async function pipelineStart() {
  chartProps = await getData(dataset);
  canvaSize();
  navBar(dataset);
  formEditor.addEventListener("change", function () {
    loadFormValues();
    draw(canvasShow, chartProps);
  });
  // Botão salvar imagem
  document.getElementById("salvar").addEventListener("click", function (e) {
    loadFormValues();
    chartProps.drawborder = true;

    draw(canvasOut, chartProps);

    this.href = imgData;
    this.download = `Roda-${dataset}.png`;

    return false;
  });

  document.getElementById("thefile").addEventListener("change", (event) => {
    const fileList = event.target.files;
    const file = fileList[0];
    const reader = new FileReader();

    reader.onloadend = (e) => {
      let json = null;
      try {
        if (!(file.name || "").toLowerCase().includes("xls")) {
          toast.warn("Envie um arquivo XLS válido");
          this.loaded();
          return;
        }

        json = importarXLS(e.target.result);
      } catch (rs) {
        alert("Formato de arquivo inválido");
        return;
      }
      chartProps = {
        time: "",
        date: "",
        colors: {
          text: "#002c5b",
          min: "#ff7474",
          med: "#ffd63f",
          max: "#00b7ad",
        },
        groups: [],
      };

      for (const line of json) {
        switch (line.field) {
          case "time":
            chartProps.time = line.data;
            break;
          case "date":
            chartProps.date = line.data;
            break;
          case "showTitle":
            chartProps.showTitle = (line.data || '').toLowerCase() === 'true';
            break;
          case "showDate":
            chartProps.showDate = (line.data || '').toLowerCase() === 'true';
            break;
          case "showSubtitles":
            chartProps.showSubtitles = (line.data || '').toLowerCase() === 'true';
            break;
          case "color.text":
            chartProps.colors.text = line.data;
            break;
          case "color.min":
            chartProps.colors.min = line.data;
            break;
          case "color.med":
            chartProps.colors.med = line.data;
            break;
          case "color.max":
            chartProps.colors.max = line.data;
            break;
          case "group":
            chartProps.groups.push({
              title: line.data,
              subtitle: line.data2,
              itens: [],
            });
            break;
          case "item":
            chartProps.groups[chartProps.groups.length - 1].itens.push({
              title: ("" + line.data).toString(),
              value: line.data2,
            });
            break;
        }
      }

      draw(canvasShow, chartProps);
    };
    reader.readAsBinaryString(file);
  });

  // Exportar
  document
    .getElementById("importar")
    .addEventListener("click", function (e) {
      var elem = document.getElementById("thefile");
      if (elem && document.createEvent) {
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, false);
        elem.dispatchEvent(evt);
      }
      return false;
    });

  // Importar
  document
    .getElementById("exportar")
    .addEventListener("click", function (e) {
      var contents = [
        { field: "time", data: chartProps.time, data2: null },
        { field: "date", data: chartProps.date, data2: null },
        { field: "showTitle", data: chartProps.showTitle ? 'true' : 'false', data2: null },
        { field: "showDate", data: chartProps.showDate ? 'true' : 'false', data2: null },
        { field: "showSubtitles", data: chartProps.showSubtitles ? 'true' : 'false', data2: null },
        { field: "color.text", data: chartProps.colors.text },
        { field: "color.min", data: chartProps.colors.min },
        { field: "color.med", data: chartProps.colors.med },
        { field: "color.max", data: chartProps.colors.max },
      ];

      for (var group of chartProps.groups) {
        contents.push({
          field: "group",
          data: group.title,
          data2: group.subtitle,
        });

        for (var item of group.itens) {
          contents.push({
            field: "item",
            data: item.title,
            data2: item.value,
          });
        }
      }

      exportXLS({ contents, filename: `roda_${dataset}` });
      return false;
    });

  makeForm(chartProps);
  loadFormValues();
  draw(canvasShow, chartProps);
}

await pipelineStart();