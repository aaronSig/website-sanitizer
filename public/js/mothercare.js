$(document).ready(function() {
	$(".date").insertAfter(".post-title")

	if($(".post-title").length == false) {
		var title = "<h2 class=\"post-title\">" + $(document).attr('title') + "</h2>";

		$(title).insertBefore(".date");
	}
});