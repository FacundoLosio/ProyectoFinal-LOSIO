class Chofer {
    constructor(vehiculo, nombre, valorHora) {
        this.vehiculo = vehiculo;
        this.nombre = nombre;
        this.valorHora = valorHora;
    }
}
obtenerFechaHoraDesdeAPI();

// creo objetos
let chofer1 = new Chofer("camion chasis", "Facundo", 5000);
let chofer2 = new Chofer("camion semi acoplado", "Martin", 10000);
let chofer3 = new Chofer("camioneta", "Claudio", 2500);
let chofer4 = new Chofer("camion chasis", "Julian", 5000);
let chofer5 = new Chofer("camioneta", "Carlos", 2500);

let lista = [chofer1, chofer2, chofer3, chofer4, chofer5];

// almaceno todo el array completo
const guardarLocal = (clave, valor) => {
    localStorage.setItem(clave, valor);
};
guardarLocal("listaChoferes", JSON.stringify(lista));

// enlazo los botones con el HTML
const botonMostrar = document.getElementById("mostrar");
botonMostrar.addEventListener("click", mostrarLista);

const botonAgregar = document.getElementById("agregar");
botonAgregar.addEventListener("click", formularioAgregar);

const botonBuscarVehiculo = document.getElementById("filtrar1");
botonBuscarVehiculo.addEventListener("click", buscarVehiculo);

const botonBuscarValor = document.getElementById("filtrar2");
botonBuscarValor.addEventListener("click", buscarValor);


const listaChoferesUI = document.createElement('ul');
document.body.appendChild(listaChoferesUI);

// declaro las funciones a utilizar

function mostrarLista() {
    // Limpia la lista antes de agregar los elementos
    listaChoferesUI.innerHTML = "";

    lista.forEach((chofer) => {
        const item = document.createElement('li');
        item.textContent = `Nombre: ${chofer.nombre}, Vehículo: ${chofer.vehiculo}, Valor Hora: ${chofer.valorHora}`;
        listaChoferesUI.appendChild(item);
    });
}

/* Utilizo libreria Sweet Alert para las siguientes funciones */
function buscarVehiculo() {
    Swal.fire({
        title: 'Buscar por Vehículo',
        input: 'select',
        inputOptions: generarOpciones(lista, 'vehiculo'),
        inputPlaceholder: 'Seleccione un vehículo',
        showCancelButton: true,
        confirmButtonText: 'Buscar',
        cancelButtonText: 'Cancelar',
        preConfirm: (result) => {
            console.log('Vehículo seleccionado:', result);

            if (!result) {
                Swal.fire('¡Cancelado!', 'No se seleccionó ningún vehículo.', 'info');
            } else {
                let resultado = lista.filter((x) => x.vehiculo.toLowerCase() === result.toLowerCase());

                mostrarResultados(resultado, 'vehículo');
            }
        }
    });
}

function buscarValor() {
    Swal.fire({
        title: 'Buscar por Valor Hora',
        input: 'select',
        inputOptions: generarOpciones(lista, 'valorHora'),
        inputPlaceholder: 'Seleccione un valor',
        showCancelButton: true,
        confirmButtonText: 'Buscar',
        cancelButtonText: 'Cancelar',
        preConfirm: (result) => {
            console.log('Valor seleccionado:', result);

            if (isNaN(result)) {
                Swal.fire('Error', 'Por favor, seleccione un valor válido.', 'error');
            } else {
                let resultado = lista.filter((x) => x.valorHora === parseFloat(result));

                mostrarResultados(resultado, 'precio');
            }
        }
    });
}

function mostrarResultados(resultado, tipo) {
    if (resultado.length > 0) {
        Swal.fire({
            title: 'Resultados de la Búsqueda',
            html: resultado.map((chofer) => `<p>${chofer.nombre} - ${chofer.vehiculo} - ${chofer.valorHora}</p>`).join(''),
        });
    } else {
        Swal.fire('Sin Resultados', `No se encontraron choferes para el ${tipo} especificado.`, 'info');
    }
}

function generarOpciones(lista, propiedad) {
    return lista.reduce((opciones, elemento) => {
        opciones[elemento[propiedad]] = elemento[propiedad];
        return opciones;
    }, {});
}

function formularioAgregar() {
    const form = document.createElement('form');
    form.innerHTML = `
        <label for="nombre">Nombre:</label>
        <input id="nombre" type="text" required>  

        <label for="vehiculo">Vehiculo:</label>
        <input id="vehiculo" type="text" required>
    
        <label for="valorHora">Valor Hora</label>
        <input id="valorHora" type="number" required>

        <button type="submit">Agregar Chofer</button>
    `;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const vehiculo = document.getElementById('vehiculo').value;
        const valorHora = parseFloat(document.getElementById('valorHora').value);

        // Validación de entrada
        if (nombre && vehiculo && !isNaN(valorHora)) {
            let chofer = new Chofer(vehiculo, nombre, valorHora);

            // Utilizo fetch para enviar datos al servidor local
            fetch('http://127.0.0.1:5500/index.html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chofer),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hubo un problema con la respuesta del servidor.');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Chofer Agregado',
                    text: `Se ha agregado a ${nombre} como chofer.`,
                });

                mostrarLista();
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al agregar el chofer. Por favor, inténtelo nuevamente.',
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, complete todos los campos correctamente.',
            });
        }

        form.reset();
    });

    const body = document.querySelector('body');
    body.appendChild(form);
}

// funcion para agregar la fecha y hora actual desde la API de WorldTime
function obtenerFechaHoraDesdeAPI() {
    fetch('http://worldtimeapi.org/api/ip')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud a la API de WorldTime');
            }
            return response.json();
        })
        .then(data => {
            // Obtiene la fecha y hora actual del objeto de respuesta
            const fechaHora = new Date(data.datetime);

            // Formatea la fecha y hora (puedes personalizar esto según tus preferencias)
            const formatoFechaHora = fechaHora.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' });

            // Muestra la fecha y hora en el contenedor en la esquina superior derecha
            const fechaHoraContainer = document.getElementById('fechaHoraContainer');
            fechaHoraContainer.textContent = formatoFechaHora;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
