import $ from "jquery";

$(() => {
  $("form").submit(function(e) {
    e.preventDefault();

    const displayMessage = message => {
      const popup = `
      <div class="error">${message}</div>
      `;

      $(popup)
        .appendTo(document.body)
        .hide()
        .fadeIn()
        .delay(2000)
        .fadeOut(function() {
          $(this).remove();
        });
    };

    const success = data => {
      if (data.error) {
        displayMessage(data.error);
      }
      if (data.message) {
        displayMessage(data.message);
      }
      if (data.redirect) window.location = data.redirect;
    };

    if ($(this).find("input[type=file]").length == 0) {
      $.ajax({
        url: this.action,
        type: this.method,
        data: $(this).serialize(),
        success
      });
    } else {
      $.ajax({
        url: this.action,
        type: this.method,
        data: new FormData(this),
        cache: false,
        contentType: false,
        processData: false,
        success
      });
    }
  });
});