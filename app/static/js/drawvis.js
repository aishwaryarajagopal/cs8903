$(function(){
  $.ajax({
      contentType: 'application/json; charset=utf-8',
      url:'/data/topic4',
      dataType: 'text',
      data: "category=Shoes",
      success: function (results) {
        var results1 = JSON.parse("[" + results + "]");
        var results = results1[0];
        var word_arr = [];
        for (var i=0; i<results.length; i++){
          for (var j=0;j<results[i]["words"].length; j++){
            if($.inArray(results[i]["words"][j]['word'], word_arr) === -1) word_arr.push(results[i]["words"][j]['word']);
          }
        }
        $( "#tags" ).autocomplete({
          source: word_arr
        });
    },
    error: function (request, status, error) {
        //alert(error);
    }
  });
});
$(function(){
  $.ajax({
      contentType: 'application/json; charset=utf-8',
      url:'/data/loadCat',
      dataType: 'json',
      success: function (results) { 
        var categories = results.categories;
        var select = document.getElementById("cat");
        for(var i = categories.length-1; i>=0 ; i--) {
            var option = document.createElement('option');
            option.text = option.value = categories[i];
            select.add(option, 0);
        }
        refreshCategory(1);
        refreshWords(results.wordjson);
        var word_arr = []
        for (var i=0;i<20;i++){
          word_arr.push(results.wordjson[i].key);
        }
        loadVis(word_arr, results.wordjson);
      },
      error: function (request, status, error) {
          //alert(error);
      }
  });
});
/*********************************************************************************/
var DragDropManager = {
  dragged: null,
  droppable: null,
  draggedMatchesTarget: function() {
    if (!this.droppable) return false;
    return true;
  }
}

function showProducts(){
  var searchIDs = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (searchIDs.length<1){
    alert("Please select at least one topic to view related products")
    return;
  }
  var topicList = searchIDs.join(",")
  var cat_select = document.getElementById("cat").value;
  var sort_select = document.getElementById("sortby").value;
  for (var i=0;i<searchIDs.length;i++){
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/topic8',
        dataType: 'json',
        data: "topics="+topicList+"&category="+cat_select+"&sortby="+sort_select,
        success: function (results) { 
          $("#prod_table tr").remove(); 
          var table = document.getElementById("prod_table");
          var tab_width = table.offsetWidth;
          if(results.length %2 == 1){
            results.pop();
          }
          for (var i=0; i< results.length; i+=2){
            var row = table.insertRow(0);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            
            var img_1 = "";
            if (results[i].score == 5)
              img_1 = "img5.png";
            else if (results[i].score == 4)
              img_1 = "img4.png";
            else if (results[i].score == 3)
              img_1 = "img3.png";
            else if (results[i].score == 2)
              img_1 = "img2.png";
            else
              img_1 = "img1.png";


            cell1.align = "top";
            cell1.innerHTML = "<a title="+results[i].title+" href=http://www.amazon.com/Nike-Womens-Black-Anthracite-Running/dp/B00EQDXPW2/ref=sr_1_5?ie=UTF8&amp;qid=1427041604&amp;sr=8-5&amp;keywords=nike+shoes > <h3 style= 'padding-top:0px;border-top-width: 0px;margin-top: 0px;margin-bottom: 0px;'>"+results[i].title+"</h3><span style='padding-top:0px;border-top-width: 0px;margin-top: 0px;margin-bottom: 0px;'>"+results[i].price+"</span> </a> <br> <img src='/static/lib/"+img_1+"' alt=Rating style='width:80px;height:18px'>";
            cell1.width = tab_width/2;

            if (results[i+1].score == 5)
              img_1 = "img5.png";
            else if (results[i+1].score == 4)
              img_1 = "img4.png";
            else if (results[i+1].score == 3)
              img_1 = "img3.png";
            else if (results[i+1].score == 2)
              img_1 = "img2.png";
            else
              img_1 = "img1.png";
            cell2.align = "top";            
            cell2.innerHTML = "<a title="+results[i+1].title+" href=http://www.amazon.com/Nike-Womens-Black-Anthracite-Running/dp/B00EQDXPW2/ref=sr_1_5?ie=UTF8&amp;qid=1427041604&amp;sr=8-5&amp;keywords=nike+shoes > <h3 style= 'padding-top:0px;border-top-width: 0px;margin-top: 0px;margin-bottom: 0px;'>"+results[i+1].title+"</h3><span style='padding-top:0px;border-top-width: 0px;margin-top: 0px;margin-bottom: 0px;'>"+results[i+1].price+"</span> </a> <br> <img src='/static/lib/"+img_1+"' alt=Rating style='width:80px;height:18px'>";

          }
        },
        error: function (request, status, error) {
            //alert(error);
        }
    });
  }
  function topic_distribution(){
    $('button a').click(function (e) {
        $('#myModal img').attr('src', $(this).attr('data-img-url'));
    });
  }

  $('.productlist').show();
  var t = $('.productlist').position().top;
  $('body').scrollTop(t);

}
function dropTargetMouseOver(dest){
  str = dest.innerHTML;
  DragDropManager.droppable = str.substring(str.indexOf(">")+1);
}
function dropTargetMouseOut(){
  DragDropManager.droppable = null;
}

var cat_select = 'Shoes'
$.ajax({
      contentType: 'application/json; charset=utf-8',
      url:'/data/loadTopics',
      dataType: 'text',
      data: "category="+cat_select,
      success: function (results) {
        var results1 = JSON.parse("[" + results + "]");
        var results2 = results1[0];
        showTopicBox(results2);
      },
      error: function (request, status, error) {
          //alert(error);
      }
});

function showTopicBox(results){
  var body = d3.select("body");

  var topics = results["topics"];

  document.getElementById('check').innerHTML = '';
  $('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()" onclick = "showWordBox('+0+')" style = "color:'+color(0)+';" > <input type="checkbox" id="myCheckbox" checked = "true" value = '+topics[0]+' />'+topics[0]+'</div><br><br>');
  for(var i=1; i< topics.length; i++){
      if (topics[i] == "dummy") continue;
      $('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()" onclick = "showWordBox('+i+')" style = "color:'+color(i)+';"> <input type="checkbox" id="myCheckbox" value = '+topics[i]+' />'+topics[i]+'</div><br><br>');
  }

  var comments = results["comments"]; 
  var draggables = d3.select(".commentbox").append("text");
  var all_comments = [];
  for(var id = 0; id< comments.length; id++){
      var comment = comments[id];
      var group_comment = comment.split(" ");
      all_comments.push.apply(all_comments, group_comment)
      all_comments.push("<BR>");
  }
  draggables.selectAll("span")
            .data(all_comments)
            .enter()
            .append("span")
            .attr("class","ui-draggable")
            .html(function(d) { return d+" " });

  $(".commentbox span").draggable({
    revert: true,
    revertDuration: 200,
    cursorAt: { left: 190, top: 0 }, 

    start: function (e) {
      DragDropManager.dragged = d3.select(e.target).datum();
    },
    // Set cursors based on matches, prepare for a drop
    drag: function (e) {
      matches = DragDropManager.draggedMatchesTarget();   
      //drop_topic = DragDropManager.droppabe;
      body.style("cursor",function() {
        return (matches) ? "copy" : "move";
      });
      // Eliminate the animation on revert for matches.
      // We have to set the revert duration here instead of "stop"
      // in order to have the change take effect.
      $(e.target).draggable("option","revertDuration",(matches) ? 0 : 200)
      

    },
    // Handle the end state. For this example, disable correct drops
    // then reset the standard cursor.
    stop: function (e,ui) {
      e.target.style.left = "0px"
      if (!DragDropManager.draggedMatchesTarget()) return;
      var targetElement = $(e.target.innerHTML);
      console.log(targetElement.selector);
      console.log(DragDropManager.droppable);

      $("body").css("cursor","");
      var cat_select = document.getElementById("cat").value;
      $.ajax({
          contentType: 'application/json; charset=utf-8',
          url:'/data/topic1',
          dataType: 'text',
          data: "word="+targetElement.selector+"&topic="+DragDropManager.droppable+"&category="+cat_select,
          success: function (results) { 
            console.log(results);
          },
          error: function (request, status, error) {
              //alert(error);
          }
      });
    }
  });
}
var color_x = d3.scale.category20();
var color = d3.scale.ordinal().range(color_x.range()); 
function showWordBox(color_i){
  $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/topic4',
        dataType: 'text',
        data: "category="+cat_select,
        success: function (results) {
          var results1 = JSON.parse("[" + results + "]");
          var results = results1[0];
          var body = d3.select("body");
          d3.select(".wordbox").selectAll("ul").remove();
          var draggables = d3.select(".wordbox").append("ul").attr("style","list-style-type: none;");
          
          // var words = results[color_i]["words"];
          var words = [];
          var wordsweights = [];
          for (var wi = 0; wi < results[color_i]["words"].length; wi++){
            words.push(results[color_i]["words"][wi]['word'])
            wordsweights.push(results[color_i]["words"][wi]['weight'])
          }

          var maxWeight = Math.max.apply(null, wordsweights);
          
          $(".commentbox").unhighlight();
          var color1 = color(color_i);
          console.log(color1);
          

          for(var wordind = 0; wordind < words.length; wordind++){
            $(".commentbox").highlight(words[wordind]);  
          }


          $(".highlight").css({ "background-color": color1 });
          
          draggables.selectAll("li")
                .data(words)
                .enter()
                .append("li")
                .attr("style","color:"+color(color_i)+";")
                .attr("class","ui-draggable")
                .html(function(d,i) { 
                    return "<div id = 'weightbox' style='display: inline-block; margin-top : 10px; width: 40px; height: 15px;border:1px solid #999'>"+
                                "<div id = 'sidebar"+i+"' style='display: inline-block; width: "+((40*wordsweights[i])/maxWeight)+"px; height: 15px;background-color: "+color(color_i)+";'>"+
                                "<div class = 'dragbar' id = 'dragweights"+i+"' ></div>"+
                              "</div>"+
                            "</div> "+
                            "<input type='checkbox' id='wordlist"+i+"' value="+d+">"+
                            "<div class = 'worddiv' style='display: inline'>"+d+"</div>"+
                            "</input><br>" });
          draggables.append("br");
          
          function getOffset( el ) {
              var _x = 0;
              var _y = 0;
              while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                  _x += el.offsetLeft - el.scrollLeft;
                  _y += el.offsetTop - el.scrollTop;
                  el = el.offsetParent;
              }
              return { top: _y, left: _x };
          }
          var i = 0;  
          var dragging = false;
          var target_id_num, box_left;
          $('.dragbar').mousedown(function(e){
            e.preventDefault();
            dragging = true;
            var target_id = e.target.id;
            target_id_num = target_id.slice(-1);
            var targetElement = document.getElementById(target_id);
            var targetElement_height = targetElement.clientHeight; 
            var targetElement_left = getOffset(targetElement).left;
            var targetElement_top = getOffset(targetElement).top + 2;
            var ghostbar = $('<div>',
                              {id:'ghostbar',
                               css: {
                                      height: targetElement_height,
                                      top: targetElement_top,
                                      left: targetElement_left
                                     }
                              }).appendTo('.wordbox');
             
              $(document).mousemove(function(e){
                targetElement = document.getElementById('weightbox');
                box_left = getOffset(targetElement).left+2;
                var outer_left = $('#outerbox').offset().left;
                var cursor_pos = e.clientX - outer_left;
                
                if (cursor_pos < box_left){
                  ghostbar.css("left",box_left);
                }
                else if (cursor_pos > box_left + 40){
                  ghostbar.css("left",box_left+40);
                }
                else{
                  ghostbar.css("left",cursor_pos);  
                }
                
             });
          });
          $(document).mouseup(function(e){
             if (dragging) 
             {
                
                 var outer_left = $('#outerbox').offset().left;
                 var cursor_pos = e.clientX - outer_left;
                 if (cursor_pos < box_left){
                    cursor_pos = box_left;
                  }
                  else if (cursor_pos > box_left + 40){
                    cursor_pos = box_left + 40;
                  }

                 $('#sidebar'+target_id_num).css("width",cursor_pos - (box_left - 2));
                 $('#ghostbar').remove();
                 $(document).unbind('mousemove');
                 dragging = false;
                 
                 var cat_select = document.getElementById("cat").value;
                 var word_select = document.getElementById("wordlist"+target_id_num).value;
                 var topic_select = results[color_i]["topic"];
                 var weight_select = ((cursor_pos - (box_left - 2)) * maxWeight)/40;
                 console.log(weight_select);
                 $.ajax({
                      contentType: 'application/json; charset=utf-8',
                      url:'/data/topic9',
                      dataType: 'text',
                      data: "category="+cat_select+"&topic="+topic_select+"&word="+word_select+"&weight="+weight_select,
                      success: function (results) {
                        console.log("Added to DB")
                      },
                      error: function (request, status, error) {
                          //alert(error);
                      }
                  });
                 
             }
          });

          $(".wordbox li").find(".worddiv").draggable({
            revert: true,
            revertDuration: 200,
            cursorAt: { left: 190, top: 0 }, 

            start: function (e) {
              DragDropManager.dragged = d3.select(e.target).datum();
            },
            // Set cursors based on matches, prepare for a drop
            drag: function (e) {
              matches = DragDropManager.draggedMatchesTarget();   
              //drop_topic = DragDropManager.droppabe;
              body.style("cursor",function() {
                return (matches) ? "copy" : "move";
              });
              $(e.target).draggable("option","revertDuration",(matches) ? 0 : 200)
              

            },
            stop: function (e,ui) {
              e.target.style.left = "0px"
              if (!DragDropManager.draggedMatchesTarget()) return;
              var targetElement = $(e.target.innerHTML);
              var x = targetElement.selector;              
              console.log("word-",x.trim());
              console.log("Topic-",DragDropManager.droppable);
              $("body").css("cursor","");
              var cat_select = document.getElementById("cat").value;
              $.ajax({
                  contentType: 'application/json; charset=utf-8',
                  url:'/data/topic1',
                  dataType: 'text',
                  data: "word="+x.trim()+"&topic="+DragDropManager.droppable+"&category="+cat_select,
                  success: function (results) { 
                    console.log(results);
                  },
                  error: function (request, status, error) {
                      //alert(error);
                  }
              });
            }
          });
        },
        error: function (request, status, error) {
            //alert(error);
        }
  });
}

/*********************************************************************************/

function refreshCategory(val){
  if (val==0){
    var category = document.getElementById("cat").value;
    
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/loadWords',
        dataType: 'text',
        data: "category="+category,
        success: function (results) {
          var results1 = JSON.parse("[" + results + "]");
          var results2 = results1[0];
          
          refreshWords(results2.wordjson);
          var word_arr = []
          for (var i=0;i<20;i++){
            word_arr.push(results2.wordjson[i].key);
          }
          
          loadVis(word_arr, results2.wordjson);
        },
        error: function (request, status, error) {
            //alert(error);
        }
    });
  }
}
function refreshWords(result_arr){
  // document.getElementById('check').innerHTML = '';
  // $('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()" onclick = "showWordBox('+i+')" style = "color:'+color(0)+';" > <input type="checkbox" id="myCheckbox" checked = "true" value = '+result_arr[0].key+' />'+result_arr[0].key+'</div><br><br>');
  // for(var i=1; i< result_arr.length; i++){
  //   if (i<10){
  //     if (result_arr[i].key == "dummy") continue;
  //     $('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()" onclick = "showWordBox('+i+')" style = "color:'+color(i)+';"> <input type="checkbox" id="myCheckbox" value = '+result_arr[i].key+' />'+result_arr[i].key+'</div><br><br>');
  //   }
  //   else{
  //     //$('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()"><input type="checkbox" id="myCheckbox" value = '+result_arr[i].key+' />'+result_arr[i].key+'</div><br><br>'); 
  //   }
  // }
  showWordBox(0);
  $(".btn").on('click', function () {
    var searchIDs = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
    //alert(searchIDs)
    loadVis(searchIDs, result_arr);
  });
}
function addWordToTopic(){
  var searchIDs = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (searchIDs.length<1){
    alert("Please select at least one topic to add the word")
    return;
  }
  var newword = document.getElementById("tags").value;
  if (newword== ''){
    alert("Please enter a word to add");
    return;
  }
  var cat_select = document.getElementById("cat").value;
  var r = confirm("Are you sure you wants to add the word '"+newword+"' to topics - ("+searchIDs+") ?");
  if (r == true) {
    for (var i=0;i<searchIDs.length;i++){
      $.ajax({
          contentType: 'application/json; charset=utf-8',
          url:'/data/topic1',
          dataType: 'text',
          data: "word="+newword+"&topic="+searchIDs[i]+"&category="+cat_select,
          success: function (results) { 
            console.log(results);
          },
          error: function (request, status, error) {
              //alert(error);
          }
      });
    }
  }
  location.reload();

}
function createNewTopic(){
  var topiclabel = prompt("Enter the topic label", "NewTopic");
  var category = document.getElementById("cat").value;
  // if (topiclabel != null) {
  //     $('#check').append('<div onmouseover = "dropTargetMouseOver(this)" onmouseout = "dropTargetMouseOut()"> <input type="checkbox" id="myCheckbox" value = '+topiclabel+' />'+topiclabel+'</div><br><br>');
  // }
  $.ajax({
      contentType: 'application/json; charset=utf-8',
      url:'/data/topic6',
      dataType: 'text',
      data: "topic="+topiclabel+"&category="+category,
      success: function (results) {
        console.log(results)
      },
      error: function (request, status, error) {
          //alert(error);
      }
  });
  location.reload();
}
function renameTopic(){
  var searchIDs = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (searchIDs.length>1){
    alert("Please select one topic at a time to rename")
    return;
  }
  var select = document.getElementById("cat").value;
  var newtopiclabel = prompt("Enter new topic label", searchIDs[0]);
  $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/topic2',
        dataType: 'text',
        data: "category="+select+"&oldtopic="+searchIDs[0]+"&newtopic="+newtopiclabel,
        success: function (results) {
          console.log(results)
        },
        error: function (request, status, error) {
            //alert(error);
        }
    });
  location.reload();
}
function removeTopic(){
  var searchIDs = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (searchIDs.length>1){
    alert("Please select one topic at a time")
    return;
  }
  var select = document.getElementById("cat");
  var newtopiclabel = "dummy"
  $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/topic3',
        dataType: 'text',
        data: "category=Shoes&oldtopic="+searchIDs[0]+"&newtopic="+newtopiclabel,
        success: function (results) {
          console.log(results)
        },
        error: function (request, status, error) {
            //alert(error);
        }
    });
    location.reload();
}
function removeTopicWord(){
  var wordList = $("#wordbox input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (wordList.length<1){
    alert("Please select at least 1 word to remove")
    return;
  }

  var topicList = $("#check input:checkbox:checked").map(function(){
      return $(this).val();
    }).get(); 
  if (topicList.length<1){
    alert("Please select at least one topic")
    return;
  }

  var select = document.getElementById("cat");

  var r = confirm("Are you sure you wants to delete the words - ("+wordList+") from the topics - ("+topicList+") ?");
  if (r == true) {
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        url:'/data/topic7',
        dataType: 'text',
        data: "category=Shoes&topics="+topicList+"&words="+wordList,
        success: function (results) {
          console.log(results)
        },
        error: function (request, status, error) {
            //alert(error);
        }
    });
  }
  location.reload();
}
function loadVis(word_list, result_arr){
  var data_pos = [];
  var data_neg = [];
  var word_arr = [];
  var gudrevcnt = [];
  var badrevcnt = [];
  var topic_pos_words = [];
  var topic_neg_words = [];
  var display_colors = [];
  for(var i=0; i< result_arr.length; i++){
    if ($.inArray(result_arr[i].key, word_list) > -1){
      display_colors.push(i);
      word_arr.push(result_arr[i].key)
      gudrevcnt.push(result_arr[i].pcount);
      badrevcnt.push(result_arr[i].ncount);
      data_pos.push(result_arr[i].Positivevalues);
      data_neg.push(result_arr[i].Negativevalues);
      topic_pos_words.push(result_arr[i].Words1);
      topic_neg_words.push(result_arr[i].Words2);
    }
  }
  d3.select("svg").remove();
  var n = word_arr.length, // number of layers
      m = data_pos[0].length, // number of samples per layer //makes the path wavy
      ctr = -1,
      ctr2 = -1,
      stack = d3.layout.stack().offset("zero"),
      layers0 = stack(d3.range(n).map(function() { return bumpLayer1(m, data_pos); })),            
      layers1 = stack(d3.range(n).map(function() { return bumpLayer2(m, data_neg); }));

  var width = 960,
      height = 500;
  var start_date = "01/01/2012";
  var end_date = '01/10/2013';
  var x = d3.time.scale().domain([new Date(start_date), new Date(end_date)]).range([0, width]);

  var y1 = d3.scale.linear()
      .domain([0, d3.max(layers0, function(layer) { return d3.max(layer, function(d) { return d.y; }); })])
      .range([height/2, 0]);
  var y2 = d3.scale.linear()
      .domain([0, d3.max(layers1, function(layer) { return d3.max(layer, function(d) { return d.y; }); })])
      .range([height/2, height]);
  
  var color = d3.scale.category20();
  
  var area1 = d3.svg.area()
              .x(function(d) { return x(d.x); })
              .y0(function(d) { return height/2; })
              .y1(function(d) { return y1(d.y); });
  var area2 = d3.svg.area()
              .x(function(d) { //console.log(x(d.x)); 
                return x(d.x); })
              .y0(function(d) { return height/2; })
              .y1(function(d) { return y2(d.y); });
  var div = d3.select("body").append("div")   
              .attr("class", "tooltip")               
              .style("opacity", 0);

  var div2 = d3.select("body").append("div")   
              .attr("class", "tooltip")               
              .style("opacity", 0);

  var zoom = d3.behavior.zoom()
                .x(x)
                .scaleExtent([1,25])
                .on("zoom", zoomed);

  var svg = d3.select(".themeriver").append("svg")
                .attr("width", width)
                .attr("height", height+50)
                .attr("transform", "translate(0,10)")
                .call(zoom)
                .on("dblclick.zoom", null);
  svg.selectAll(".path")
      .data(layers0)
      .enter().append("path")
      .attr("class","path")
      .attr("d", area1)
      .style("fill", function(d,i) { return color(display_colors[i]%20); })
      .on("click", function(d, i) {
          d3.selectAll('.path').transition()
                .style("opacity",function(d,i1){if (i!= i1){ return 0;}})
          d3.selectAll('.path2').transition()
                .style("opacity",function(d,i1){if (i!= i1){ return 0;}});
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("<strong>"+word_arr[i]+"<BR>Good review count : "+gudrevcnt[i] + "<BR>Bad review count : "+badrevcnt[i]+"</strong>")
              .style("left", 750 + "px")     
              .style("top", 650 + "px");    

          })                  
      .on("dblclick", function(d) {     
        d3.selectAll('.path').transition()
              .style("opacity", 1);
        d3.selectAll('.path2').transition()
              .style("opacity", 1);  
          div.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
  svg.selectAll(".path2")
      .data(layers1)
      .enter()
      .append("path")
      .attr("class","path2")
      .attr("d", area2)
      .style("fill", function(d,i) { return color(display_colors[i]%20); })
      .on("click", function(d, i) {
          d3.selectAll('.path').transition()
                .style("opacity",function(d,i1){if (i!= i1){ return 0}});
          d3.selectAll('.path2').transition()
                .style("opacity",function(d,i1){if (i!= i1){ return 0}});
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("<strong>"+word_arr[i]+"<BR>Good review count : "+gudrevcnt[i] + "<BR>Bad review count : "+badrevcnt[i]+"</strong>")
              .style("left", "750px")     
              .style("top", "650px");    
          })                 
      .on("dblclick", function(d) {   
        d3.selectAll('.path').transition()
              .style("opacity", 1);
        d3.selectAll('.path2').transition()
              .style("opacity", 1);    
          div.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
  var line = svg.append("line")
                          .attr("x1", 0)
                          .attr("y1", height/2)
                          .attr("x2", width)
                          .attr("y2", height/2)
                          .attr("stroke-width", 1)
                         .attr("stroke", "black");
  var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(5)
                .tickSize(2);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + 500 + ")")
    .call(xAxis);

  var yAxisTop = d3.svg.axis().scale(y1)
    .orient("left").ticks(5);
  
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxisTop);

  var yAxisBottom = d3.svg.axis().scale(y2)
    .orient("left").ticks(5);
  
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxisBottom);

  function bumpLayer1(n, data_samplesx) {
    var a = [], i;
    ctr++;
    for (i = 0; i < n; ++i) a[i] = 0;
    var st_dt = new Date('01/01/2012');
    return a.map(function(d, i) { return {x: new Date(new Date(st_dt).getTime() + i*24*60*60*1000), y: data_samplesx[ctr][i]}; });
  }
  function bumpLayer2(n, data_samplesy) {
    var a = [], i;
    ctr2++;
    for (i = 0; i < n; ++i) a[i] = 0;
    var st_dt = new Date('01/01/2012');
    //return a.map(function(d, i) { return {x: new Date(new Date(st_dt).setMonth(st_dt.getMonth()+i)), y: data_samplesy[ctr2][i]}; });
    return a.map(function(d, i) { return {x: new Date(new Date(st_dt).getTime() + i*24*60*60*1000), y: data_samplesy[ctr2][i]}; });
  }
  var showRiver = [];
  for (var i = 0; i < n; i++) {
    showRiver.push(true);
  }
  function zoomed() {
    var currentZoom = d3.event.scale;

    svg.selectAll('.path').remove();
    svg.selectAll('.path2').remove();
    svg.selectAll('.topicwords').remove();

    svg.select("g.x.axis").call(xAxis);

    svg.selectAll(".path")
      .data(layers0)
      .enter().append("path")
      .attr("class","path")
      .attr("d", area1)
      .style("fill", function(d,i) { return color(display_colors[i]%20); })
      .on("click", function(d, i) {
          svg.selectAll('.topicwords').remove();
          if (currentZoom > 18){
            for(ind=0;ind<topic_pos_words[i].length;ind++){
              if(topic_pos_words[i][ind] == 0){
                console.log("");
              }
              else{
                word_ind = 0;
                word_point_arr = topic_pos_words[i][ind].split(",");
                for(var wi = 0;wi<word_point_arr.length;wi++){
                  textHeight = height/2 - (word_ind * 14) - 10;
                  if(word_point_arr[wi]!=""){
                      word_ind++;
                    }
                  yHeight = y1(d[ind].y);
                  if (textHeight > yHeight){
                    wordText = svg.append("text")
                                .attr("class","topicwords")
                                .attr("x", x(d[ind].x)-13)
                                .attr("y", textHeight)
                                .attr("font-size","10")
                                .attr("dy", ".35em")
                                .text(word_point_arr[wi]);
                  }
                }
              }
            }
            for(ind=0;ind<topic_neg_words[i].length;ind++){
                
                if(topic_neg_words[i][ind] == 0){
                  //console.log("");
                }
                else{
                  word_ind = 0;
                  word_point_arr = topic_neg_words[i][ind].split(",");
                  for(var wi = 0;wi<1;wi++){
                    textHeight = height/2 + (word_ind * 14) + 10;
                    if(word_point_arr[wi]!=""){
                      word_ind++;
                    }
                    yHeight = 600;
                    if (textHeight < yHeight){
                      wordText = svg.append("text")
                                  .attr("class","topicwords")
                                  .attr("x", x(d[ind].x)-10)
                                  .attr("y", textHeight)
                                  .attr("font-size","10")
                                  .attr("dy", ".35em")
                                  .text(word_point_arr[wi]);
                    }
                  }
                }
              }
          }
          d3.selectAll('.path').transition()
                .style("opacity",function(d,i1){if (i!= i1){ showRiver[i1] = false; return 0;}})
          d3.selectAll('.path2').transition()
                .style("opacity",function(d,i1){if (i!= i1){ showRiver[i1] = false; return 0;}});
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("<strong>"+word_arr[i]+"<BR>Good review count : "+gudrevcnt[i] + "<BR>Bad review count : "+badrevcnt[i]+"</strong>")
              .style("left", 750 + "px")     
              .style("top", 650 + "px"); 

          })                  
      .on("dblclick", function(d) {  
        div.transition()        
                .duration(500)      
                .style("opacity", 0); 
        
        svg.selectAll('.topicwords').remove();
        d3.selectAll('.path').transition()
              .style("opacity", 1);
        d3.selectAll('.path2').transition()
              .style("opacity", 1);
        for(var show_i = 0; show_i< n; show_i++){
          showRiver[show_i] = true;
        }  
      })
      .on("mouseover", function(d, i) {  
        if (currentZoom > 18 && showRiver[i]){
          div2.transition()        
                .duration(200)      
                .style("opacity", .9);      

          var msDay = 60*60*24*1000;
          var day_diff = Math.floor((x.invert(d3.event.pageX) - new Date(start_date))/msDay) - 2;
          var d = x.invert(d3.event.pageX);
          d.setDate(d.getDate()-2);
          var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",  "Oct", "Nov", "Dec");

          div2 .html(d.getDate()+"-"+m_names[d.getMonth()]+"-"+d.getFullYear() +"<BR>Good review count : "+data_pos[i][day_diff] + "<BR>Bad review count : "+data_neg[i][day_diff])
              .style("left", (d3.event.pageX - 250) + "px")     
              .style("top", (d3.event.pageY) + "px");   
        }
      })
      .on("mouseout", function(d, i) {  
        div2.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
      svg.selectAll(".path2")
        .data(layers1)
        .enter()
        .append("path")
        .attr("class","path2")
        .attr("d", area2)
        .style("fill", function(d,i) { return color(display_colors[i]%20); })
        .on("click", function(d, i) {
            svg.selectAll('.topicwords').remove();
            if (currentZoom > 18){
              for(ind=0;ind<topic_neg_words[i].length;ind++){
                
                if(topic_neg_words[i][ind] == 0){
                  //console.log("");
                }
                else{
                  word_ind = 0;
                  word_point_arr = topic_neg_words[i][ind].split(",");
                  for(var wi = 0;wi<word_point_arr.length;wi++){
                    textHeight = height/2 + (word_ind * 14) + 10;
                    if(word_point_arr[wi]!=""){
                      word_ind++;
                    }
                    yHeight = y2(d[ind].y);
                    if (textHeight < yHeight){
                      wordText = svg.append("text")
                                  .attr("class","topicwords")
                                  .attr("x", x(d[ind].x)-10)
                                  .attr("y", textHeight)
                                  .attr("font-size","10")
                                  .attr("dy", ".35em")
                                  .text(word_point_arr[wi]);
                    }
                  }
                }
              }
              for(ind=0;ind<topic_pos_words[i].length;ind++){
                if(topic_pos_words[i][ind] == 0){
                  console.log("");
                }
                else{
                  word_ind = 0;
                  word_point_arr = topic_pos_words[i][ind].split(",");
                  for(var wi = 0;wi<1;wi++){
                    textHeight = height/2 - (word_ind * 14) - 10;
                    if(word_point_arr[wi]!=""){
                        word_ind++;
                      }
                    yHeight = 0;
                    if (textHeight > yHeight){
                      wordText = svg.append("text")
                                  .attr("class","topicwords")
                                  .attr("x", x(d[ind].x)-13)
                                  .attr("y", textHeight)
                                  .attr("font-size","10")
                                  .attr("dy", ".35em")
                                  .text(word_point_arr[wi]);
                    }
                  }
                }
              }
            }
            d3.selectAll('.path').transition()
                  .style("opacity",function(d,i1){if (i!= i1){ return 0}});
            d3.selectAll('.path2').transition()
                  .style("opacity",function(d,i1){if (i!= i1){ return 0}});
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html("<strong>"+word_arr[i]+"<BR>Good review count : "+gudrevcnt[i] + "<BR>Bad review count : "+badrevcnt[i]+"</strong>")
                .style("left", "750px")     
                .style("top", "650px");    
            })                  
        .on("dblclick", function(d) {   
          div.transition()        
                .duration(500)      
                .style("opacity", 0); 
          svg.selectAll('.topicwords').remove();
          d3.selectAll('.path').transition()
                .style("opacity", 1);
          d3.selectAll('.path2').transition()
                .style("opacity", 1);      
        })
        .on("mouseover", function(d, i) {  
          if (currentZoom > 18){
            div2.transition()        
                  .duration(200)      
                  .style("opacity", .9);      
                    
            var msDay = 60*60*24*1000;
            var day_diff = Math.floor((x.invert(d3.event.pageX) - new Date(start_date))/msDay) - 2;
            var d = x.invert(d3.event.pageX);
            d.setDate(d.getDate()-2);
            var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",  "Oct", "Nov", "Dec");

            div2 .html(d.getDate()+"-"+m_names[d.getMonth()]+"-"+d.getFullYear() +"<BR>Good review count : "+data_pos[i][day_diff] + "<BR>Bad review count : "+data_neg[i][day_diff])
                .style("left", (d3.event.pageX - 250) + "px")     
                .style("top", (d3.event.pageY) + "px");   
          }
        })
        .on("mouseout", function(d, i) {  
          div2.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });   
      var line = svg.append("line")
                          .attr("x1", 0)
                          .attr("y1", height/2)
                          .attr("x2", width)
                          .attr("y2", height/2)
                          .attr("stroke-width", 1)
                         .attr("stroke", "black");
  }    
}