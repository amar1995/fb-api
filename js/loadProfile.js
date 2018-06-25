var isModalOpened = 0;

//Timeout limit
var timeout = 3000;

//FB Access Token
var fbAccessToken = "EAACEdEose0cBAEZBqGSdY5w74EBbRN6PYfMsJ1oxnLbNtZAJyAWxhoSnXqGrZAwXk6Nqs8cX92gz8qPo4wVps7Fo2BuxEe40rQGrUuD8hGfOdoGy1YzM93WvxI4Yn4YfVzUAvrCfYW0mLGiLLlZBEaNZCy526Pgwix64ZCN4fR0iscnK0UYNQkM9HiDBBE3crKyTFgQjSfMwZDZD";

//URL to fetch FB Profile
var fbProfileURL = "https://graph.facebook.com/v3.0/me?access_token=" + fbAccessToken + "&fields=picture.type(large),location,name,quotes,about,hometown,birthday";

//URL to fetch FB Posts
var fbPostsURL = "https://graph.facebook.com/v3.0/me?access_token=" + fbAccessToken + "&fields=posts{caption,created_time,description,from,full_picture,message,shares}";

//Base FB URL to fetch likes and comments per post
var fbBaseURL = "https://graph.facebook.com/v3.0/";


//Fetch FB Profile Info
function getFBInfo(){
	$.ajax(fbProfileURL,{
		success : function(response){
			$("#img-profile-pic").attr('src', response.picture.data.url);
			$("#name").text(response.name);
			$("#location").text(response.location.name);
			$("#hometown").text(response.hometown.name);
			$("#dob").text(response.birthday);
			
			showAllQuotes(response.quotes);
			
			if(response.about !== undefined){
				$("#about").text("<br>" + "<span>" + response.about + "</span>");
			}
		},
		timeout : timeout,
		error : function(response){
			openModal("profile_error", getMessage(response));
		}
});
}
/*******************************************************/

//Fetch FB Posts
function getFBPosts(){
	$.ajax(fbPostsURL,{
		success : function(response){
			var data = response.posts.data;
			
			$.each(data, function(index, element){
				if(index % 2 == 0){
					$("#timeline").append(generateHTML("left", element));
				}else{
					$("#timeline").append(generateHTML("right", element));
				}
			});	
			},
		timeout : timeout,
		error : function(response){
			openModal("posts_error", getMessage(response));
		}
	});
}
/*******************************************************/

//Fetch likes per post
function getLikes(post_id){
	var likesURL = fbBaseURL + post_id + "/likes?summary=true&access_token=" + fbAccessToken;
	var count = 0;
			
	$.ajax({
		type : "get",
		url : likesURL,
		success : function(response){
			count = getDataFromElement(response.summary).total_count;
			$("#likes_" + post_id).text(count);
		},
		timeout : timeout,
		error : function(response){
			console.log("Failed to get likes for post: " + post_id);
		}
	});	
}
/*******************************************************/

//Fetch comments per post
function getComments(post_id){
	var commentsURL = fbBaseURL + post_id + "/comments?summary=true&access_token=" + fbAccessToken;
	var count = 0;
			
	$.ajax({
		type : "get",
		url : commentsURL, 
		success : function(response){
			count = getDataFromElement(response.summary).total_count;	
			$("#comments_" + post_id).text(count);
		},
		timeout : timeout,
		error : function(response){
			console.log("Failed to get comments for post: " + post_id);
		}
	});
}
/*******************************************************/

//Generate Posts
function generateHTML(type, element){
	var output = "";
	var html = "<div class='content'>" +
      					"<h4>" + getDataFromElement(element.from.name) + "</h4>" +
						"<h6> <secondary>" + formatTime(getDataFromElement(element.created_time)) + "</secondary> </h6>" + 
      					"<p>" + getDataFromElement(element.message) + "</p>" + 
    					"<img class='img-fluid' src=" + getDataFromElement(element.full_picture) + ">" +
						"<div class='row adjust'>" + 
						"<div class='col-lg-4 col-md-4 col-sm-4 col-xs-4' style='border: 1px solid #000'>" +
							"<div style='width:100%'><img class='icon img-fluid' src='https://png.icons8.com/ios/32/000000/facebook-like.png'> <span class='badge' id='likes_" + element.id + "'> " + verifyCount(getLikes(getDataFromElement(element.id))) + "</span></div>" +
						"</div>" +
						"<div class='col-lg-4 col-md-4 col-sm-4 col-xs-4' style='border: 1px solid #000'>" +
							"<div style='width:100%'><img class='icon img-fluid' src='https://png.icons8.com/windows/32/000000/speech-bubble.png'> <span class='badge' id='comments_" + element.id + "'> " + verifyCount(getComments(element.id)) + "</span></div>" +
						"</div>" +
						"<div class='col-lg-4 col-md-4 col-sm-4 col-xs-4' style='border: 1px solid #000'>" +
							"<div style='width:100%'><img class='icon img-fluid' src='https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-share-32.png'> <span class='badge'> " + verifyCount(getDataFromElement(element.shares).count) + "</span></div>" +
						"</div>" +
					"</div>";
	
	if(type == "left"){
		output = "<div class='container left'>" +
    				html +
  				"</div>";
	}
	
	if(type == "right"){
		output = "<div class='container right'>" +
    				html +
  				"</div>";
	}
		
	return output;
}
/*******************************************************/

//Format time of post
function formatTime(element){
	if(element.length > 0){
		var token = element.split("T");
		var date = new Date(token[0]);
		var time = token[1].split("+");
		
		return date.getDate()  + "/" + date.getMonth() + "/" + date.getFullYear() + " " + time[0];
	}
}
/*******************************************************/

//Open modal to display error message 
function openModal(type, response){
	$("#header-title").attr("style", "color:#000");
	$("#body-text").attr("style", "color:#000; word-wrap:break-word;");
	$("#body-text").text(response);
	
	if(type == "profile_error"){
		$("#header-title").html("Facebook Profile");
		$("#try-again").attr("onclick", "getFBInfo()");
	}
	
	if(type == "posts_error"){
		$("#header-title").html("Facebook Post");
		$("#try-again").attr("onclick", "getFBPosts()");
	}
	
	$("#myModal").modal("show");
	console.log("modal shown");
}
/*******************************************************/

//Get the message from error code
function getMessage(response){
	if(response.status == 0)
		return "Timeout waiting for response";
	
	if(response.status == 400)
		return response.responseJSON.error.message;
	
	return 0;
}
/*******************************************************/

//Verify if count is a valid number
function verifyCount(count){
	return count == undefined ? 0 : count;
}
/*******************************************************/

//Verify if data fetched is not undefined
function getDataFromElement(element){
	return (element != undefined) ? element : "";
}
/*******************************************************/

//Display users' favourite FB quotes
function showAllQuotes(quotes){
	var quotes = quotes.split("\n");
	var allQuotes = "";
	$.each(quotes, function(index, element){
		allQuotes += "<span>" + element + "<span>" + "<br>";
	});
			
	$("#quotes").html(allQuotes);
}
/*******************************************************/

//Show back to top button
function showTopButton() {
    if (document.getElementById("myNav").scrollTop > 20) {
        document.getElementById("top-btn").style.display = "block";
    } else {
        document.getElementById("top-btn").style.display = "none";
    }
}
/*******************************************************/

// Scroll to the top of the document
function scrollToTop() {
    document.getElementById("myNav").scrollTop = 0;
}
/*******************************************************/

//Open the overlay window
function openNav() {
    document.getElementById("myNav").style.width = "100%";
}
/*******************************************************/

//Close the overlay window
function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}
/*******************************************************/

$(document).ready(getFBInfo());

$(".posts_btn").on("click", getFBPosts);

$("#myNav").scroll(showTopButton);