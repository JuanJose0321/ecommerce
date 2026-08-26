import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function ProductDetailsAccordion() {
  return (
    <Accordion className="w-full">
      <AccordionItem value="shipping">
        <AccordionTrigger>Envio y entrega</AccordionTrigger>
        <AccordionContent>
          Envio estandar en 3-5 dias habiles o exprés en 24-48 horas dentro de
          Mexico. El costo exacto se calcula en el checkout segun tu codigo
          postal.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="materials">
        <AccordionTrigger>Materiales y cuidado</AccordionTrigger>
        <AccordionContent>
          Cada pieza pasa por control de calidad manual antes de salir de
          nuestro taller. Evita el contacto prolongado con agua, perfumes o
          superficies abrasivas para conservar el acabado.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Devoluciones</AccordionTrigger>
        <AccordionContent>
          Tienes 30 dias naturales desde la entrega para solicitar un cambio o
          devolucion, siempre que la pieza no muestre uso.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
