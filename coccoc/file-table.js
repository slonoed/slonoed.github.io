(function() {
    'use strict';

    // constants
    const ASC = 'asc';
    const DESC = 'desc';
    const NAME = 'name';
    const SIZE = 'size';
    const DATE = 'lastModifiedDate';
    const labels = {
        [NAME]: 'Name',
        [SIZE]: 'Size',
        [DATE]: 'Date'
    };

    // Sorters for files, arguments are files
    const sorters = {
        [DATE]: function(a, b) { return a[DATE] - b[DATE] },
        [SIZE]: function(a, b) { return a[SIZE] - b[SIZE] },
        [NAME]: function(a, b) {
            return a[NAME].toLowerCase() > b[NAME].toLowerCase() ? 1 : -1;
        }
    };

    /**
     * Check file are equal
     * @param  {Object} f1 first file
     * @param  {Object} f2 second file
     * @return {Boolean} true if files equal
     */
    function compareFiles(f1, f2) {
        return f1.name === f2.name
    }

    /**
     * Shortcut for createElement
     */
    const ce = document.createElement.bind(document);

    /**
     * Create array from collections
     * @param  {*} collection
     * @return {Array}
     */
    function toArray(collection) {
        return Array.prototype.slice.call(collection);
    }

    /**
     * Shortcut for getElementsByTagName
     * @param  {Element} element
     * @param  {String]} tag
     * @return {Array}
     */
    function byTag(element, tag) {
        return toArray(element.getElementsByTagName(tag));
    }

    /**
     * Build negate function (numbers)
     * @param  {Function} foo function that return number
     * @return {Function} function that return negative number from src function
     */
    function negate(foo) {
        return function() { return -foo.apply(null, arguments)};
    }

    /**
     * Return formatted date string
     * @param  {Date} date
     * @return {String}
     */
    function formatDate(date) {
        return date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2);
    }

    /**
     * Return formatted file size
     * @param  {Number} size
     * @return {String}
     */
    function formatSize(size) {
        const floor = Math.floor;
        if (size > 1000000000) return floor(size/1000000000) + ' GB';
        if (size > 1000000) return floor(size/1000000) + ' MB';
        if (size > 1000) return floor(size/1000) + ' KB';
        return size + ' B';
    }

    /**
     * Create copy of file object
     * @param  {Object} file source file
     * @return {Object}
     */
    function copyFile(file) {
        return {
            [NAME]: file[NAME],
            [SIZE]: file[SIZE],
            [DATE]: new Date(file[DATE])
        };
    }

    // handlers

    function onInputChanged(fileTable, e) {
        addFiles(fileTable, e.target.files);
        render(fileTable);
        e.target.value = '';
    }

    function onHeaderClick(fileTable, sortBy, e) {
        e.preventDefault();
        if (fileTable.sortBy === sortBy) {
            fileTable.sortDirection = fileTable.sortDirection === ASC ? DESC : ASC;
        }
        else {
            fileTable.sortBy = sortBy;
            fileTable.sortDirection = ASC;
        }
        render(fileTable);
    }

    function onDragStart(fileTable, row, file, e) {
        row.className = 'indrag';
        fileTable.files.splice(fileTable.files.indexOf(file), 1);
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.setData('files', JSON.stringify([file]));
    }

    function onDragEnd(fileTable, row, e) {
        e.preventDefault();
        row.className = '';
        render(fileTable);
    }

    // end handlers

    /**
     * Add files to file table, has side effect: alert, when existed files added
     * @param {Object} fileTable FileTable instance
     * @param {Array} files new files
     */
    function addFiles(fileTable, files) {
        const newFiles = [];
        const existedFiles = [];
        toArray(files).forEach(function(f) {
            const existed = fileTable.files.some(compareFiles.bind(null, f));
            if (existed) existedFiles.push(f);
            else newFiles.push(copyFile(f));
        });

        fileTable.files = fileTable.files.concat(newFiles);
        if (existedFiles.length)
            alert("Haven't added:\n" + existedFiles.map(function(e) {
                return e.name
            }).join('\n'));
    }

    /**
     * Create file row (<tr>) for table
     * @param  {Object} file
     * @return {Element}
     */
    function createRow(file) {
        const row = ce('tr');
        row.innerHTML = '<td>' + file.name +
            '</td><td>' + formatSize(file.size) +
            '</td><td>' + formatDate(file.lastModifiedDate) +'</td>';
        return row;
    }

    function render(fileTable) {
        let body = byTag(fileTable.table, 'tbody')[0];
        const control = body.lastChild;

        let sorter = sorters[fileTable.sortBy];
        if (fileTable.sortDirection === DESC) sorter = negate(sorter);

        fileTable.table.removeChild(body)
        body = fileTable.files
            .sort(sorter)
            .reduce(function(rows, file) {
                let row = fileTable.rows.get(file);
                if (!row) {
                    row = createRow(file)
                    row.setAttribute('draggable', true);
                    row.addEventListener('dragstart', onDragStart.bind(null, fileTable, row, file));
                    row.addEventListener('dragend', onDragEnd.bind(null, fileTable, row));
                }
                rows.appendChild(row);
                return rows;
            }, ce('tbody'));

        body.appendChild(control);

        fileTable.table.appendChild(body);

        // render sort icons
        byTag(fileTable.table, 'th').forEach(function(th) {
            th.getAttribute('data-name') === fileTable.sortBy ?
                th.setAttribute('data-sort', fileTable.sortDirection) :
                th.removeAttribute('data-sort');
        });
    };

    /**
     * FileTable constructor
     * @param {Element} element table will be inserted into this node
     * @param {Array} [files] itinial set of files
     *  file: { name: String, size: Number, lastModifiedDate: Date }
     */
    function FileTable(element, files) {
        const fileTable = this;
        const table = ce('table');

        fileTable.table = table;
        fileTable.sortBy = NAME;
        fileTable.sortDirection = ASC;
        fileTable.files = files || [];
        fileTable.rows = new WeakMap(); // store pairs file - rowNode

        table.innerHTML = '<thead></thead>' +
            '<tbody>' +
                '<tr><td colspan="3"><label>' +
                '<div class="button">Select file</div>' +
                '<input type="file" multiple/>' +
                '</label></td></tr>' +
            '</tbody>';

        const head = ce('head');
        byTag(table, 'thead')[0]
            .appendChild([NAME, SIZE, DATE].reduce(function(row, sortBy) {
                const th = ce('th');
                th.innerHTML = labels[sortBy];
                th.setAttribute('data-name', sortBy);
                th.addEventListener('click', onHeaderClick.bind(null, fileTable, sortBy))
                row.appendChild(th);
                return row;
            }, ce('tr')));

        render(fileTable);

        table.addEventListener('dragover', function(e) {
            e.preventDefault()
            table.className = 'active';
            e.dataTransfer.dropEffect = 'move';
        });
        table.addEventListener("dragleave", function(e) {
            e.preventDefault()
            table.className = '';
        });
        table.addEventListener('drop', function(e) {
            e.preventDefault();
            fileTable.table.className = '';
            addFiles(fileTable, e.dataTransfer.files.length ?
                e.dataTransfer.files :
                JSON.parse(e.dataTransfer.getData('files')));
            render(fileTable);
        });

        byTag(table, 'input')[0].addEventListener('change', onInputChanged.bind(null, fileTable));

        element.appendChild(table);
    };

    /**
     * Serialize files data
     * @return {Array} return array of file objects
     */
    FileTable.prototype.serialize = function() {
        return this.files.map(copyFile);
    };

    window.FileTable = FileTable;
})();
