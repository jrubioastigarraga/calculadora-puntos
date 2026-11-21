import { Component } from '@angular/core';

type CodeItem = { code: string; title: string; text: string; cls: string };

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly primary: CodeItem[] = [
    { code: 'A', cls: 'code-a', title: 'Destino definitivo', text: 'Funcionario o funcionaria de carrera que ya tiene un destino definitivo y participa voluntariamente para cambiar de centro.' },
    { code: 'B', cls: 'code-b', title: 'Excedente voluntario', text: 'Personal en excedencia voluntaria que participa para reincorporarse al servicio activo.' },
    { code: 'E', cls: 'code-e', title: 'Supresión o modificación', text: 'El puesto que ocupaba con carácter definitivo ha sido suprimido o modificado. Puede llevar derecho preferente.' },
    { code: 'F', cls: 'code-f', title: 'Reingreso provisional', text: 'Reingresa al servicio activo con un destino provisional y participa para conseguir uno definitivo.' },
    { code: 'J', cls: 'code-j', title: 'Sin primer destino', text: 'Funcionario o funcionaria que todavía no ha obtenido su primer destino definitivo; es la situación de la OPE en los forzosos.' },
  ];

  readonly all: CodeItem[] = [
    { code: 'A', cls: 'code-a', title: 'Destino definitivo', text: 'Funcionario/a de carrera con destino definitivo que participa voluntariamente para cambiar de centro.' },
    { code: 'B', cls: 'code-b', title: 'Excedente voluntario', text: 'Personal en excedencia voluntaria que participa para reingresar al servicio activo.' },
    { code: 'C', cls: 'code-x', title: 'Resolución firme de expediente disciplinario', text: 'La participación deriva de una resolución firme de expediente disciplinario.' },
    { code: 'D', cls: 'code-x', title: 'Sentencia o resolución de recurso', text: 'La situación deriva del cumplimiento de una sentencia o de la resolución de un recurso.' },
    { code: 'E', cls: 'code-e', title: 'Supresión o modificación del puesto', text: 'El puesto desempeñado con carácter definitivo ha sido suprimido o modificado.' },
    { code: 'F', cls: 'code-f', title: 'Reingreso con destino provisional', text: 'Reingresa al servicio activo con destino provisional y participa para obtener uno definitivo.' },
    { code: 'G', cls: 'code-x', title: 'Excedencia forzosa', text: 'Personal en excedencia forzosa que participa para reingresar.' },
    { code: 'H', cls: 'code-x', title: 'Suspensión de funciones', text: 'Vuelve al servicio activo una vez cumplida la sanción de suspensión.' },
    { code: 'I', cls: 'code-x', title: 'Causas análogas', text: 'Otras causas que hayan supuesto la pérdida del puesto desempeñado con carácter definitivo.' },
    { code: 'J', cls: 'code-j', title: 'Sin primer destino definitivo', text: 'Funcionario/a de carrera que aún no ha obtenido su primer destino definitivo.' },
    { code: 'K', cls: 'code-x', title: 'Funcionario/a en prácticas', text: 'Seleccionado/a en un proceso selectivo que todavía no ha sido nombrado/a funcionario/a de carrera.' },
  ];

  readonly faqs = [
    { q: '¿La modalidad suma puntos?', a: 'No. La puntuación sale del baremo (apartados 1 a 6) y de los desempates. La modalidad solo describe la situación administrativa.' },
    { q: '¿Por qué solo aparecen A, B, E, F y J?', a: 'Porque son las que figuran en los listados de resolución cargados (2010-2025). C, D, G, H, I y K existen en la convocatoria, pero no aparecen en esos listados.' },
    { q: '¿Qué significa «Ya con plaza» en Forzosak?', a: 'Que la persona ya tenía un destino adjudicado en el concurso anterior. No es una modalidad: evita que vuelva a consumir una plaza nueva. La asignación azul de principio de curso no cuenta como plaza de concurso.' },
    { q: '¿Qué es el derecho preferente?', a: 'Es distinto de la modalidad. Da preferencia para un centro o una localidad/zona en supuestos como supresión o modificación del puesto, desplazamiento por insuficiencia de horario, adquisición de nuevas especialidades, cuidado de familiares, sentencia o rehabilitación. Sus códigos (A-G) son independientes de A-K.' },
    { q: '¿Qué es PL1 y PL2?', a: 'Son los perfiles lingüísticos: PL1 es el puesto exento de la exigencia de euskera y PL2 el que la requiere. No es una modalidad.' },
    { q: '¿Qué es la RPT?', a: 'La Relación de Puestos de Trabajo es la plantilla orgánica de los centros. No contiene información de ocupación: no indica cuántas plazas están vacantes o sin cubrir.' },
    { q: '¿Los datos son oficiales?', a: 'No. Es una herramienta de consulta. Ante cualquier duda prevalecen la convocatoria, la Orden y la resolución administrativa.' },
  ];
}
