export const menu = {
    gitext: {title: 'Gitext', items: 'changeRepo changeFile | compareBranches | logout'},
    file: {title: 'File', items: 'print | quickSave saveIn | quickRestore getFrom'},
    edit: {
        title: 'Edit',
        items: 'undo redo | cut copy paste | selectall | searchreplace'
    },
    view: {
        title: 'View',
        items: 'code | visualaid visualchars visualblocks | wordcount'
    },
    insert: {
        title: 'Insert',
        items: 'image link media template codesample inserttable | charmap emoticons hr | ' +
            'pagebreak nonbreaking anchor toc | insertdatetime'
    },
    format: {
        title: 'Format',
        items: 'strikethrough superscript subscript codesample code | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat'
    },
    table: {
        title: 'Table',
        items: 'inserttable | cell row column | tableprops deletetable'
    },
    help: {title: 'Help', items: 'help'},
    custom: {title: 'Custom menu', items: 'nesteditem toggleitem'}
}