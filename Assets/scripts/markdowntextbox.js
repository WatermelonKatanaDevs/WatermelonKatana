
function markdownTextbox(sel,nobr) {
  var markbox = document.querySelector(sel);
  markbox.classList.add("mk-textbox");
  if (markbox.parentElement.innerHTML.includes('title="Pick Emoji"')) return;
  markbox.insertAdjacentHTML("afterend", `
    ${nobr?"":"<br>"}
    <button type="button" title="Bold" onclick="replaceSelectedText(document.querySelector('${sel}'),t=>'**'+t+'**')">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M5 6C5 4.58579 5 3.87868 5.43934 3.43934C5.87868 3 6.58579 3 8 3H12.5789C15.0206 3 17 5.01472 17 7.5C17 9.98528 15.0206 12 12.5789 12H5V6Z" clip-rule="evenodd" fill-rule="evenodd"></path>
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M12.4286 12H13.6667C16.0599 12 18 14.0147 18 16.5C18 18.9853 16.0599 21 13.6667 21H8C6.58579 21 5.87868 21 5.43934 20.5607C5 20.1213 5 19.4142 5 18V12"></path>
      </svg>
    </button>
    <button type="button" title="Italic" onclick="replaceSelectedText(document.querySelector('${sel}'),t=>'*'+t+'*')">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M12 4H19"></path>
        <path stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M8 20L16 4"></path>
        <path stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M5 20H12"></path>
      </svg>
    </button>
    <button type="button" title="Underline" onclick="replaceSelectedText(document.querySelector('${sel}'),t=>'__'+t+'__')">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M5.5 3V11.5C5.5 15.0899 8.41015 18 12 18C15.5899 18 18.5 15.0899 18.5 11.5V3"></path>
        <path stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M3 21H21"></path>
      </svg>
    </button>
    <button type="button" title="Strikethrough" onclick="replaceSelectedText(document.querySelector('${sel}'),t=>'~~'+t+'~~')">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M4 12H20"></path>
      <path stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M17.5 7.66667C17.5 5.08934 15.0376 3 12 3C8.96243 3 6.5 5.08934 6.5 7.66667C6.5 8.15279 6.55336 8.59783 6.6668 9M6 16.3333C6 18.9107 8.68629 21 12 21C15.3137 21 18 19.6667 18 16.3333C18 13.9404 16.9693 12.5782 14.9079 12"></path>
      </svg>
    </button>
    <button type="button" title="Insert Image" onclick="replaceSelectedText(document.querySelector('${sel}'),async(t)=>{var url = await getFileUpload(); if (!url) { return t; } return '![height=100]('+url+')';})">
       <svg fill="#707277" viewBox="0 0 1024 1024" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM338 304c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm513.9 437.1a8.11 8.11 0 0 1-5.2 1.9H177.2c-4.4 0-8-3.6-8-8 0-1.9.7-3.7 1.9-5.2l170.3-202c2.8-3.4 7.9-3.8 11.3-1 .3.3.7.6 1 1l99.4 118 158.1-187.5c2.8-3.4 7.9-3.8 11.3-1 .3.3.7.6 1 1l229.6 271.6c2.6 3.3 2.2 8.4-1.2 11.2z"></path>
      </svg>
    </button>
    <button type="button" title="Add Link" onclick="replaceSelectedText(document.querySelector('${sel}'),t=>'['+t+'](https://)')">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"></path>
      </svg>
    </button>
    <button type="emojiPicker" class="emojiPicker" type="button" title="Pick Emoji">
      <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
<circle stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" r="10" cy="12" cx="12"></circle>
<path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#707277" d="M8 15C8.91212 16.2144 10.3643 17 12 17C13.6357 17 15.0879 16.2144 16 15"></path>
      <path stroke-linejoin="round" stroke-linecap="round" stroke-width="3" stroke="#707277" d="M8.00897 9L8 9M16 9L15.991 9"></path>
      </svg>
    </button>`);
  var picker = new EmojiPicker({
    trigger: [
        {
          selector: '.emojiPicker',
          insertInto: ['.mk-textbox']
        },
    ],
    closeOnSelect: true,
    closeButton: true,
  });
}

function getInputSelection(el) {
  var start = 0, end = 0, normalizedValue, range,
    textInputRange, len, endRange;

  if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
    start = el.selectionStart;
    end = el.selectionEnd;
  } else {
    range = document.selection.createRange();

    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, "\n");

      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart("character", -len);
        start += normalizedValue.slice(0, start).split("\n").length - 1;

        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd("character", -len);
          end += normalizedValue.slice(0, end).split("\n").length - 1;
        }
      }
    }
  }

  return {
    start: start,
    end: end
  };
}

async function replaceSelectedText(el, text) {
  var sel = getInputSelection(el), val = el.value;
  var seltext = val.slice(sel.start,sel.end);
  if (typeof text == 'function') text = await text(seltext);
  el.value = val.slice(0, sel.start) + text + val.slice(sel.end);
}
