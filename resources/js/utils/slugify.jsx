/**
 * Convierte un texto a un formato URL-seguro (slug).
 * Ejemplo: "Recursos Humanos" -> "recursos-humanos"
 */
export const slugify = (text) => {
    return text.toString().toLowerCase()
        .trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Quita acentos y tildes
        .replace(/\s+/g, '-')         // Reemplaza espacios con -
        .replace(/[^\w\-]+/g, '')     // Elimina caracteres especiales no alfanuméricos
        .replace(/\-\-+/g, '-')       // Reemplaza guiones múltiples con uno solo
        .replace(/^-+/, '')           // Elimina guiones al principio
        .replace(/-+$/, '');          // Elimina guiones al final
};