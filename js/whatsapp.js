document.addEventListener("DOMContentLoaded", () => {

    const btnWhatsapp = document.getElementById("btnWhatsapp");

    btnWhatsapp.addEventListener("click", () => {

        const telefono = "56988476743";
        const mensaje = "Hola, quisiera obtener mas informacion.";

        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");

    });

});