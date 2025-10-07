let stompClient = null;

function connect() {
	console.log("Attempting to connect to WebSocket...");
	const socket = new SockJS("/ws");
	stompClient = Stomp.over(socket);

	stompClient.connect(
		{},
		function (frame) {
			console.log("CONNECTED to server:", frame);
			$("#chat-room").removeClass("d-none");
			$("#name-form").addClass("d-none");

			stompClient.subscribe("/topic/public", function (message) {
				console.log("Received message from server:", message.body);
				try {
					const msg = JSON.parse(message.body);
					showMessage(msg);
				} catch (err) {
					console.error("Failed to parse message:", err);
				}
			});
		},
		function (error) {
			console.error("STOMP connection error:", error);
		},
	);
}

function showMessage(message) {
	console.log("Displaying message:", message);
	$("#message-container-table").prepend(
		`<tr><td><b>${message.sender}:</b> ${message.content}</td></tr>`,
	);
}

function sendMessage() {
	const msg = {
		sender: localStorage.getItem("username"),
		content: $("#message-value").val(),
	};
	console.log("Sending message:", msg);
	if (stompClient && stompClient.connected) {
		stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));
	} else {
		console.warn("STOMP client is not connected. Cannot send message.");
	}
}

$(document).ready(function () {
	console.log("Document ready. Setting up event handlers.");

	$("#login").click(function () {
		const username = $("#name-value").val();
		console.log("Login clicked. Username:", username);
		localStorage.setItem("username", username);
		connect();
	});

	$("#send").click(function () {
		console.log("Send button clicked.");
		sendMessage();
	});

	$("#logout").click(function () {
		console.log("Logout clicked.");
		if (stompClient) {
			stompClient.disconnect(function () {
				console.log("Disconnected from server.");
			});
		}
		localStorage.removeItem("username");
		$("#chat-room").addClass("d-none");
		$("#name-form").removeClass("d-none");
		$("#message-container-table").empty();
	});
});
