function postNote(id) {


    var data = {
       title :$('#title').val(),
      body :$('#body').val(),
      author : $('#author').val(),
    };
    $.post(`http://localhost:3000/notes/${id || ''}`,
        data,
       function(data,status) {
            $('#addForm').empty();
            if(status ==='success')
            {
                $('#addForm').empty();
                console.log('async test');
            }
            else{
                console.log('Something occured while saving data. Please try once more.');
            }
            getNotes();

        });
    };
//postItem()

$('#click').on('click', function() {
    postItem();
});
//template to render name and age
const Item = ({ title, body,author ,_id}) => `
        <div id="${_id}">
        <h2>${title}<h2>
        <p>${body}</p>- <i>${author}</i>
        <br><br><br>
        <button onclick="editForm()">Edit</button>
        <button onclick="deleteNote()">Delete</button>
        </div>
    `;


function getNotes(){
    $.get('/home',function(data,status){
        // $.each(data, function() {
        //    alert(this.name);
        //   });
        console.log(data);
        $('#home').html(data.map(Item).join(''));
    });
}
$(document).ready(function() {
    // executes when HTML-Document is loaded and DOM is ready
    getNotes();
});
$('#addNote').on('click',function(){
    //console.log('add note button clicked');
    $('#home').empty();
    $('#addForm').append(`
    <label for="title">Title</label>
    <input type="text" name="title" id="title">
    <label for="body">Body</label>
    <input type="text" name="body" id="body">
    <label for="author">Author</label>
    <input type="text" name="author" id="author">
    <button onclick="postNote()">Submit</button>
    `);

});
$('#getNote').on('click',function(){
    getNotes();
    $('#addForm').empty();

});

function editForm(){
    var id = $("button").closest("div").prop("id");
    $('#home').empty();


    $.get(`http://localhost:3000/notes/${id}`,function(data,status){
        $('#addForm').append(`
        <label for="title">Title</label>
        <input type="text" name="title" id="title" value=${data.title}>
        <label for="body">Body</label>
        <input type="text" name="body" id="body" value=${data.body}>
        <label for="author">Author</label>
        <input type="text" name="author" id="author" value=${data.author}>
        <button onclick="postNote('${data._id}')">Submit</button>
        `);
    });



}
