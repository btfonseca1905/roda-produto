var formEditor = document.querySelector("#graph-editor");
      var currentDate = new Date();
      var chartProps = {
        time: "",
        date: "",
        drawborder: false,
        showTitle: true,
        showDate: true,
        showSubtitles: false,
        colors: {
          text: "#002c5b",
          min: "#ed1566",
          med: "#ffc002",
          max: "#02ff1a",
        },
        groups: [
          {
            title: "Discovery",
            itens: [
              { title: "Customer Centric", value: 1 },
              { title: "Design Thinking", value: 1 },
              { title: "Outras Metodologias", value: 1 },
              { title: "UX & Usabilidade", value: 1 },
              { title: "Definição de Roadmap", value: 1 },
            ],
          },
          {
            title: "Delivery",
            itens: [
              { title: "Agilidade", value: 1 },
              { title: "Scrum", value: 1 },
              { title: "Dual Track", value: 1 },
              { title: "Tecnologia em Produtos", value: 1 },
              { title: "Gestão de Risco", value: 1 },
            ],
          },
          {
            title: "Product",
            itens: [
              { title: "Aculturamento", value: 1 },
              { title: "Gestão 3.0", value: 1 },
              { title: "Estratégia de Negócios", value: 1 },
              { title: "OKR", value: 1 },
              { title: "Comunicação", value: 1 },
            ],
          },
          {
            title: "Cultura de Produto",
            itens: [
              { title: "Melhoria Contínua", value: 1 },
              { title: "Entrega de Valor", value: 1 },
              { title: "Coleta de feedback", value: 1 },
              { title: "Métricas de Produto", value: 1 },
              { title: "Product Marketing", value: 1 },
            ],
          },
        ],
        itens: [],
      };

      // Ajusta tamanho do canvas
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
            itemInput.setAttribute("min", "0");
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
        if (this.value === '0') {          
          if (confirm("Deseja remover este item da lista?")) {
            var groupPos = parseInt(this.getAttribute("group-pos"));
            var itemPos = parseInt(this.getAttribute("item-pos"));
            chartProps.groups[groupPos].itens.splice(itemPos,1);

            chartProps.itens = [];

            makeForm(chartProps);
            loadFormValues();
            draw(canvasShow, chartProps);
          } else {
            this.value = '1';
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
        this.download = "Roda-Agil.png";
        
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

          exportXLS({ contents, filename: "roda_agil" });
          return false;
        });

      makeForm(chartProps);
      loadFormValues();
      draw(canvasShow, chartProps);
