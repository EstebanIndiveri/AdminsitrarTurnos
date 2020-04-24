let DB;

//selectores de la interdaz:

const form =document.querySelector('form'),
nombreMascota=document.querySelector('#mascota'),
nombreCliente=document.querySelector('#cliente'),
telefono=document.querySelector('#telefono'),
date=document.querySelector('#fecha'),
hora=document.querySelector('#hora'),
sintomas=document.querySelector('#sintomas'),
citas=document.querySelector('#citas'),
headingAdministra=document.querySelector('#administra');

//esperar por el dom ready
document.addEventListener('DOMContentLoaded',()=>{
    //crea la base de datos:

    let crearDB=window.indexedDB.open('citas',1);

    //si hay un error enviarlo a la consola:
    crearDB.onerror=function(){
        console.log('hubo un error');
    }

    crearDB.onsuccess=function(){
        // console.log('todo bien');

        //asignar a la base de datos:

        DB=crearDB.result;

        mostrarCitas();
        // console.log(DB);
    }

    //este metodo solo corre una vez crea el schema DB:
    crearDB.onupgradeneeded=function(e){
        let db=e.target.result;
        console.log(db);

        //defino objecstore 2 params nombre y opciones:
        //keyPath es el indice:
        let objectStore=db.createObjectStore('citas',{keyPath:'key', autoIncrement:true});
        
        //Creo indices y campos createIndex 3 parametros nombre, keypath, opciones:

        objectStore.createIndex('mascota','mascota',{unique:false});
        objectStore.createIndex('cliente','cliente',{unique:false});
        objectStore.createIndex('telefono','telefono',{unique:false});
        objectStore.createIndex('fecha','fecha',{unique:false});
        objectStore.createIndex('hora','hora',{unique:false});
        objectStore.createIndex('sintomas','sintomas',{unique:false});
        console.log('bas de datos creaday lista!!');

    }
    form.addEventListener('submit',agregarDatos);
    function agregarDatos(e){
        e.preventDefault();

        const nuevaCita={
            mascota:nombreMascota.value,
            cliente:nombreCliente.value,
            telefono:telefono.value,
            fecha:fecha.value,
            hora:hora.value,
            sintomas:sintomas.value
        }
        // console.log(nuevaCita);
        //indexDB se utilizan las transacciones
        let transaccion = DB.transaction(['citas'],'readwrite');
        let objectStore=transaccion.objectStore('citas');
        // console.log(objectStore);
        let peticion=objectStore.add(nuevaCita);
        console.log(peticion);
        peticion.onsuccess=()=>{
            form.reset();

        }
        transaccion.oncomplete=()=>{
            console.log('cita agregada');
        mostrarCitas();

        }
        transaccion.onerror=()=>{
            console.log('ocurrion un error');
        }
    }
    function mostrarCitas(){
        //limpio
        while(citas.firstChild){
            citas.removeChild(citas.firstChild);
        }

        //creamos un objectStore
        let objectstore=DB.transaction('citas').objectStore('citas');

        //retorna una peticion

        objectstore.openCursor().onsuccess=function(e){

            let cursor=e.target.result;
            // console.log(cursor);

            if(cursor){
                let citaHTML=document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('list-group-item');

                citaHTML.innerHTML=`
                <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                <p class="font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                <p class="font-weight-bold">Teléfono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                <p class="font-weight-bold">fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                <p class="font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                `;
                //boton borrar:
                const borrarBtn=document.createElement('button');
                borrarBtn.classList.add('borrar','btn','btn-danger');
                borrarBtn.innerHTML='<span aria-hidden="true">X</span> Borrar';
                borrarBtn.onclick=borrarCita;
                citaHTML.appendChild(borrarBtn);
                //append en el padre.
                citas.appendChild(citaHTML);
                //consuitlar proximos
                cursor.continue();
            }else{
                //no registros:
                if(!citas.firstChild){
                    headingAdministra.textContent='Agrega citas para comenzar';
                    let listado=document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent='No hay registros';
                    citas.appendChild(listado);
                }else{
                    headingAdministra.textContent='Administra tus citas';
                }
            }
        }
    }
    function borrarCita(e){
       let citaID= Number(e.target.parentElement.getAttribute('data-cita-id'));
        console.log(citaID);
       let transaction=DB.transaction(['citas'],'readwrite');
       let objectStore=transaction.objectStore('citas');

       let peticion=objectStore.delete(citaID);

       transaction.oncomplete=()=>{
        e.target.parentElement.parentElement.removeChild(e.target.parentElement);

        console.log(`Se eliminó la cita con el ID: ${citaID}`);
        
        if(!citas.firstChild){
            headingAdministra.textContent='Agrega citas para comenzar';
            let listado=document.createElement('p');
            listado.classList.add('text-center');
            listado.textContent='No hay registros';
            citas.appendChild(listado);
        }else{
            headingAdministra.textContent='Administra tus citas';
        }
       }
    }
});