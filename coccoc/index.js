

document.addEventListener('DOMContentLoaded', function() {
    new FileTable(document.getElementById('files'));
    const table = new FileTable(document.getElementById('files2'), [
        {
            size: 1024000000,
            name: 'file name 1',
            lastModifiedDate: new Date(2015, 7, 8)
        },
        {
            size: 256000,
            name: 'file name 2',
            lastModifiedDate: new Date(2010, 1, 4)
        },
        {
            size: 128,
            name: 'file name 3',
            lastModifiedDate: new Date(2012, 4, 5)
        }
    ]);

    document
        .getElementById('serialize')
        .addEventListener('click', function(e) {
            e.preventDefault();
            alert(JSON.stringify(table.serialize(), null, 4));
        });
}, false);
