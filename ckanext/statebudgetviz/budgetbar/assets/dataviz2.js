this.ckan.module('dataviz_view', function (JQuery, _) {
  return {
    initialize: function() {
//    var y_axis_title = this.options.resourceView.y_axis_title ? this.options.resourceView.y_axis_title : y_axis;
//    var chart_title = this.options.resourceView.chart_title ? this.options.resourceView.chart_title : "";
        const package_id = this.options.resourceView.package_id;
        const resource_id = this.options.resourceView.resource_id;
        const download_url = this.options.resourceView.download_url;

    console.log(this.options);
    // YES

  /* Variable Declarations */
  const actuals = "Actuals 2017-18",
    bePrev = "Budget 2018-19",
    re = "Revised 2018-19",
    be = "Budget 2019-20";

  const hierarchy = 'Grant Number, Major Head, Sub Major Head, Minor Head, Sub Head, Sub Sub Head, Detail Head, Sub detail Head'.split(",");

  const currencySymbol = "&#8377;";

  const currencyUnit = "Lakh(s)";

  const convertedUnit = "Crore";
  var currentUint = currencyUnit;

  const fiscalYearList = [be,re,bePrev,actuals];

  let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  const maxTickLength = 35;

  function onDataLoad() {
    d3.select(".grant-content-wrapper")
      .style("display", "block")
      .style("opacity", 0)
      .transition()
      .delay(700)
      .style("opacity", 1);

    d3.select(".spinner")
      .style("display", "none");
  }

  const formatLongNumber = d3.format(".1f"),
    formatCrore = function(x) {
      return formatLongNumber(x / 1e7) + "Cr";
    },
    formatLakh = function(x) {
      return formatLongNumber(x / 1e5) + "L";
    },
    formatThousand = function(x) {
      return formatLongNumber(x / 1e3) + "k";
    },
    formatLowerDenom = function(x) {
      return x;
    };

  function formatCurrency(x) {
    let v = Math.abs(x);
    return (v >= .9995e7 ? formatCrore : v >= .9995e5 ? formatLakh : v >= .999e3 ? formatThousand : formatLowerDenom)(x);
  }

  function formatLongNumbertoString(x) {
    let negative = x < 0,
        str = String(negative ? -x : x),
        arr = [],
        i = str.indexOf("."),
        j;

    if (i === -1) {
        i = str.length;
    } else {
        for (j = str.length - 1; j > i; j--) {
            arr.push(str[j]);
        }
        arr.push(".");
    }
    i--;

    for (j = 0; i >= 0; i--, j++) {
        if (j > 2 && (j % 2 === 1)) {
            arr.push(",");
        }
        arr.push(str[i]);
    }

    if (negative) {
        arr.push("-");
    }
    return arr.reverse().join("");
  };




  function formatUnit(d){
    if(d<100)
    {
      currentUnit = currencyUnit;
      return d.toFixed(2);
    }
    else{
      currentUnit = convertedUnit;
      return (d / 100).toFixed(2);
    }
  }


  /* Grant summary */

   function loadGrantSummary(raw_data) {
	    let data = d3.nest()
		.key(function(d) { return d["Major"]; })
		.rollup(function(v) {
		    return {
			act: d3.sum(v, function(d) { return +d[actuals]; }),
			be: d3.sum(v, function(d) { return +d[be]; }),
			bePrev: d3.sum(v, function(d) { return +d[bePrev]; }),
			re: d3.sum(v, function(d) { return +d[re]; })
		    };
		})
		.entries(raw_data);
	    //add_grant_summary(nested_data);

	    let totalExpenditure = {};
	    totalExpenditure["key"] = "Total Expenditure";
	    totalExpenditure["values"] = [];
	    let temp = {};
	    temp["label"] = actuals;
	    temp["value"] = data[0].values.act;
	    totalExpenditure["values"].push(temp);

	    temp = {};
	    temp["label"] =bePrev;
	    temp["value"] = data[0].values.re;
	    totalExpenditure["values"].push(temp);

	    temp = {};
	    temp["label"] = re;
	    temp["value"] = data[0].values.bePrev;
	    totalExpenditure["values"].push(temp);

	    
	    temp = {};
	    temp["label"] = be;
	    temp["value"] = data[0].values.be;
	    temp["series"] = 0;
	    totalExpenditure["values"].push(temp);
	    d3.select("#be-figures").html(function(d) {
		let content = "<span class='absolute-figure'>" + currencySymbol + " " + formatLongNumbertoString(formatUnit(data[0].values.be)) + " <span class='curreny-unit'>" + currentUnit + "</span> </span><br>";

		let percentageChange = (((data[0].values.be - data[0].values.bePrev) / data[0].values.bePrev) * 100).toFixed(1);

		content += "<span class='percentage-figures'>";
		    if (percentageChange > 0) {
		    content += "<i class='fas fa-arrow-up positive-fig'></i> "
		} 
		else if(percentageChange == 0){
		    content += "<i class='fas nochange-fig'></i> "
		}
		else {
		    content += "<i class='fas fa-arrow-down negative-fig'></i> "
		}
		content += "<span class='percentage-num" + (percentageChange > 0 ? " positive-fig'" : " negative-fig'") + ">" + percentageChange + "%" + "</span></span>"
		return content;
	    })

	    d3.select("#re-figures").html(currencySymbol + " " + formatLongNumbertoString(formatUnit(data[0].values.re)) + " <span class='curreny-unit'>" + currentUnit + "</span> ");

	    d3.select("#actuals-figures").html(currencySymbol + " " + formatLongNumbertoString(formatUnit(data[0].values.act)) + " <span class='curreny-unit'>" + currentUnit + "</span> ");

	    d3.select("#bePrev-figures").html(currencySymbol + " " + formatLongNumbertoString(formatUnit(data[0].values.bePrev)) + " <span class='curreny-unit'>" + currentUnit + "</span> ");

	    drawbarchart([totalExpenditure], ".summary_vis");

	    function drawbarchart(data, selection) {

		nv.addGraph(function() {
		    chart = nv.models.multiBarHorizontalChart()
			.x(function(d) { return d.label })
			.y(function(d) { return +d.value * 100000 }) //Fix Unit Issue
			.barColor(["#d64700", "#fdba38",'#21405d','#rgb(116, 173, 209)'])

			.duration(250)
			
			.margin({ left: 130, right: 75, top: 20, bottom: 30 })
			.stacked(false)
			.showControls(false)
			.showLegend(false);

		    chart.height(130)
		    chart.yAxis.tickPadding(8);
		    chart.yAxis.ticks(2).tickFormat(function(d) {
			return formatCurrency(d)
		    });

		    chart.yAxis.axisLabel("Figures in " + currencyUnit)

		    
			
		    chart.tooltip.valueFormatter(function(d) {
			    return d.toFixed(1) + " " + currencyUnit;
			})

		    chart.tooltip.contentGenerator(function(obj) {
			console.log(obj)
			console.log(obj.color)
			var header = obj.series[0].key
			var headerhtml = "<div class='row'><div class='col-lg-12'><div class='tooltip-point-title'style='background-color: " + obj.color + ";'>" + obj.data.label+ "</div></div></div>"

			var bodyhtml = "<div class='row'><div class='col-lg-12 text-center'><div class='tooltip-point-body'><span class='tooltip-x-val'>" + header + "</span><span class='tooltip-y-value'>"+ "₹"+ " " + obj.data.value.toFixed(1) + " " + currencyUnit + "</span></div></div>";

			return headerhtml + '' + bodyhtml;
		    })

		    chart.tooltip.enabled(true)
		    
		    

		    if (w < 400) {
			chart.yAxis.ticks(2)
		    }

		    d3.select(selection).append("svg")
			.datum(data)
			.call(chart);
		    nv.utils.windowResize(chart.update);

		    return chart;
		});
	    }
	}


  /* Hierarcy Viz   */
  function loadHierarchyVis(data, fiscalYear) {

    let margin = { top: 30, right: 40, bottom: 0, left: 170 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    if (w > 992) {
      margin = { top: 30, right: 20, bottom: 0, left: 200 },
        width = 650 - margin.left - margin.right

    } else if (w < 400) {
      margin = { top: 30, right: 20, bottom: 0, left: 160 },
        width = w - margin.left - margin.right - 30
    }

    const x = d3.scale.linear()
      .range([0, width]);

    const barHeight = 20;

    const color = d3.scale.ordinal()
      .range(["#40627C", "#A7A37E"]);

    const duration = 750,
      delay = 25;

    let partition = d3.layout.partition()
      .value(function(d) { return d.size; });

    let xAxis = d3.svg.axis()
      .scale(x)
      .orient("top")
      .ticks(5)
      .tickFormat(function(d) { return formatCurrency(d); });

    if (w < 450) {
      xAxis.ticks(3);
    }

    let svg = d3.select(".vis").select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", function(d) {
        up(d);
      });

    svg.append("g")
      .attr("class", "x axis");

    svg.append("g")
      .attr("class", "y axis")
      .append("line")
      .attr("y1", "0%");

    let tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([0, 10])
      .direction(function(d, i) {
        if (w < 450) {
          return 'n'
        }
        return "e"
      });


    svg.call(tip);

    function populateYearSelection(data) {
      d3.select(".select-dropdown")
        .append("select")
        .attr("class", "form-control")
        .attr("id", "figure-select")
        .on("change", function() {
          let year = d3.select("#figure-select").property("value");
          drawVis(data, year)
        })
        .selectAll("option")
        .data(fiscalYearList)
        .enter()
        .append("option")
        .attr("class", "option-select")
        .text(function(d) {
          return d;
        });
    }
    year = ['Budget 2019-20','Revised 2018-19', 'Budget 2018-19','Actuals 2017-18']

    drawVis(data, year)
    function drawVis(data, fiscalYear) {

      //Change the Hardcoded attribute
      let nestedData = d3.nest()
        .key(function(d) { return d["Grant Number"]; })
        .key(function(d) { return d["Major Head"]; })
        .key(function(d) { return d["Sub-Major Head"]; })
        .key(function(d) { return d["Minor Head"]; })
        .key(function(d) { return d["Sub-Minor Head"]; })
        .key(function(d) { return d["Detailed Head"]; })
        .key(function(d) { return d["Object Head"]; })
        .key(function(d) { return d["Voucher Head"]; })
        .rollup(function(leaves) {
          return d3.sum( leaves, function(d) { return +d[fiscalYear] * 100000; });
        })
        .entries(data);

      function renameStuff(d) {
        d.name = d.key;
        delete d.key;
        if (typeof d.values === "number") {
          d.size = d.values;
        }
        else {
          d.values.forEach(renameStuff), d.children = d.values;
        }
        delete d.values;
      }

      renameStuff(nestedData[0]);

      let partition = d3.layout.partition()
        .value(function(d) {
          return parseInt(d.size);
        });

      d3.select(".nav-breadcrumb").select(".breadcrumb").html("");

      root = nestedData[0]
      partition.nodes(root);
      x.domain([0, root.value]).nice();
      down(root, 0);

      tip.html(function(d) {
        return "<strong>" + fiscalYear + "</strong> : <span>" + formatCurrency(d.value) + "</span>";
      })
    }

    function createHeadBreadcrumb(e) {
      if (e.children) {
        d3.select(".nav-breadcrumb").select(".breadcrumb")
          .append("li")
          .attr("class", "breadcrumb-item")
          .attr("data-level", e.depth)
          .text(e.name)
          .style("cursor", "pointer")
          .on("click", function() {
            d3.select(".nav-breadcrumb").select(".breadcrumb")
              .selectAll("li").filter(function() {
              return this.getAttribute("data-level") >= e.depth
            }).remove();
            down(e);
          })
      }
    }

    function removeBreadcrumb(d){
      if (d.parent) {
        d3.select(".nav-breadcrumb").select(".breadcrumb").select("li:last-child").transition()
          .delay(250).style("opacity", 0).remove();
      }
    }

    function createList(d, i) {
      if (d.depth <= 0) {
        d3.select(".back").style("display", "none");
      } else {
        d3.select(".back").style("display", "inline-block")
          .on("click", function() { up(d) })
          .style("cursor", "pointer");
      }
      if (d.children) {
        d3.select(".side-navbar-list").selectAll("*").remove();

        d3.select(".side-navbar-title")
          .html(hierarchy[d.depth + 1]).style("opacity", 0).transition().delay(500).style("opacity", 1);

        let sidebarList = d3.select(".side-navbar-list")
          .append("ul")
          .attr("class", "nav flex-column");

        let listItems = sidebarList.selectAll("li")
          .data(d.children)
          .enter()
          .append("li")
          .attr("class", "nav-item");

        listItems.append("a")
          .attr("class", "nav-item")
          .html(function(d) {
            return d.name;
          })
          .on("click", function(d) {
            down(d)
          })
          .style("cursor", function(d) {
            return !d.children ? null : "pointer";
          });

        d3.select(".side-navbar-list").style("opacity", 0).transition()
          .delay(550).style("opacity", 1);
      }
    }

    function down(d, i) {
      createList(d, 0)
      createHeadBreadcrumb(d)

      if (!d.children || this.__transition__) return;
      let end = duration + d.children.length * delay;

      // Mark any currently-displayed bars as exiting.
      let exit = svg.selectAll(".enter")
        .attr("class", "exit");

      // Entering nodes immediately obscure the clicked-on bar, so hide it.
      exit.selectAll("rect").filter(function(p) { return p === d; })
        .style("fill-opacity", 1e-6);

      // Enter the new bars for the clicked-on data.
      // Per above, entering bars are immediately visible.
      let enter = bar(d)
        .attr("transform", stack(i))
        .style("opacity", 1);

      // Have the text fade-in, even though the bars are visible.
      // Color the bars as parents; they will fade to children if appropriate.
      enter.select("text").style("fill-opacity", 1e-6);
      enter.select("rect").style("fill", color(true));

      // Update the x-scale domain.
      x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

      // Update the x-axis.
      svg.selectAll(".x.axis").transition()
        .duration(duration)
        .call(xAxis);

      // Transition entering bars to their new position.
      let enterTransition = enter.transition()
        .duration(duration)
        .delay(function(d, i) { return i * delay; })
        .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

      // Transition entering text.
      enterTransition.select("text")
        .style("fill-opacity", 1);

      // Transition entering rects to the new x-scale.
      enterTransition.select("rect")
        .attr("width", function(d) { return x(d.value); })
        .style("fill", function(d) { return color(!!d.children); });

      // Transition exiting bars to fade out.
      let exitTransition = exit.transition()
        .duration(duration)
        .style("opacity", 1e-6)
        .remove();

      // Transition exiting bars to the new x-scale.
      exitTransition.selectAll("rect")
        .attr("width", function(d) { return x(d.value); });

      // Rebind the current node to the background.
      svg.select(".background")
        .datum(d)
        .transition()
        .duration(end);

      d.index = i;
    }

    function up(d) {

      createList(d.parent, 0)
      removeBreadcrumb(d)
      if (!d.parent || this.__transition__) return;
      let end = duration + d.children.length * delay;

      // Mark any currently-displayed bars as exiting.
      let exit = svg.selectAll(".enter")
        .attr("class", "exit");

      // Enter the new bars for the clicked-on data's parent.
      let enter = bar(d.parent)
        .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
        .style("opacity", 1e-6);

      // Color the bars as appropriate.
      // Exiting nodes will obscure the parent bar, so hide it.
      enter.select("rect")
        .style("fill", function(d) { return color(!!d.children); })
        .filter(function(p) { return p === d; })
        .style("fill-opacity", 1e-6);

      // Update the x-scale domain.
      x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

      // Update the x-axis.
      svg.selectAll(".x.axis").transition()
        .duration(duration)
        .call(xAxis);

      // Transition entering bars to fade in over the full duration.
      let enterTransition = enter.transition()
        .duration(end)
        .style("opacity", 1);

      // Transition entering rects to the new x-scale.
      // When the entering parent rect is done, make it visible!
      enterTransition.select("rect")
        .attr("width", function(d) { return x(d.value); })
        .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

      // Transition exiting bars to the parent's position.
      let exitTransition = exit.selectAll("g").transition()
        .duration(duration)
        .delay(function(d, i) { return i * delay; })
        .attr("transform", stack(d.index));

      // Transition exiting text to fade out.
      exitTransition.select("text")
        .style("fill-opacity", 1e-6);

      // Transition exiting rects to the new scale and fade to parent color.
      exitTransition.select("rect")
        .attr("width", function(d) { return x(d.value); })
        .style("fill", color(true));

      // Remove exiting nodes when the last child has finished transitioning.
      exit.transition()
        .duration(end)
        .remove();

      // Rebind the current parent to the background.
      svg.select(".background")
        .datum(d.parent)
        .transition()
        .duration(end);
    }

    // Creates a set of bars for the given data node, at the specified index.
    function bar(d) {

      d3.select(".y").select("line")
        .attr("y1", d.children.length * 24 + 5 + "px");

      if (d.children.length * 25 > 400) {
        d3.select(".vis").select("svg")
          .attr("height", d.children.length * 25);
      } else {
        d3.select(".vis").select("svg")
          .attr("height", 400);
      }

      let bar = svg.insert("g", ".y.axis")
        .attr("class", "enter")
        .attr("transform", "translate(0,5)")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function(d) {
          return !d.children ? null : "pointer";
        })
        .on("click", function(d, i) {
          down(d, i)
        });

      bar.append("text")
        .attr("x", -6)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .attr("width", "40px")
        .text(function(d) {
          if (d.name.length < maxTickLength) {
            return d.name;
          }
          else{
            return d.name.substring(0, maxTickLength - 3) + '...';
          }
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      bar.append("rect")
        .attr("width", function(d) {
          return x(d.value);
        })
        .attr("height", barHeight)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
      return bar;
    }

    // A stateful closure for stacking bars horizontally.
    function stack(i) {
      let x0 = 0;
      return function(d) {
        let tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
        x0 += x(d.value);
        return tx;
      };
    }

    drawVis(data,fiscalYear);
    populateYearSelection(data);
  }


   /* Data table */
   function loadDataTable(data){
	    data.forEach(function(d){
		d['Head Description in English'] =   d['Head Description in English'].split("$").join(" | ")

	    })
	    let tableSelect = d3.select('#container-data').append("table")
	    .attr("class", "table table-striped table-bordered responsive")
	    .attr("id", "exp_table")
	    .style("width","100%"); 
	    
	    let selectedColumns = "Head Of Account,Head Description in English".split(",").concat(fiscalYearList);

	    let tableColumns = [];
	    for(let i in selectedColumns){
		let temp = {}
		temp["data"] = selectedColumns[i]
		temp["title"] = selectedColumns[i]
		tableColumns.push(temp)
	    }

	    $('#exp_table').DataTable( {
		"processing": true,
		responsive: true,
		"bLengthChange": false, // Disable page size change
		data: data,
		columns: tableColumns,
		dom: 'Bfrtip',
		buttons :['csvHtml5',
		'excelHtml5',
		'pdfHtml5']
	    });
	}



  (function() {
    d3.csv(download_url, function(data) {

      onDataLoad();

      console.log(data)

      loadHierarchyVis(data, be);

      d3.select(".dataset-download").attr("href", download_url);

    });
  })();

    }
  }
});
