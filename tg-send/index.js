const $ = e => document.getElementById(e);

$('form').addEventListener('submit', event => {
  event.preventDefault();
  const token = $('token').value;
  const data = {
    chat_id: Number($('chat').value),
    text: $('text').value,
    parse_mode: 'Markdown',
    disable_web_page_preview: !$('preview').checked,
    disable_notification: !$('notification').checked
  };
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(() => {
    $('status').style.display = 'block';
    $('status').className = 'alert alert-success';
    $('status').innerText = 'Done!';
  }).catch(e => {
    $('status').style.display = 'block';
    $('status').className = 'alert alert-danger';
    $('status').innerText = 'Error';
  })
});

$('generate').addEventListener('click', event => {
  event.preventDefault();
  const token = $('token').value;
  const data = {
    chat_id: Number($('chat').value),
    text: $('text').value,
    parse_mode: 'Markdown',
    disable_web_page_preview: !$('preview').checked,
    disable_notification: !$('notification').checked
  };
  const json = JSON.stringify(data);
  const cmd = `curl -H "Content-Type: application/json" -X POST -d '${json}' https://api.telegram.org/bot${token}/sendMessage`

  $('curltext').style.display = 'block';
  $('curltext').innerText = cmd;
});
