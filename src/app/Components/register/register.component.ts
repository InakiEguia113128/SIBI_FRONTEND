import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Usuario } from 'src/app/Models/Register/i-usuario';
import { UserService } from 'src/app/Services/Users/user.service';
import Swal from 'sweetalert2';

interface RegI{
  visible: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() onRegister : EventEmitter<RegI> = new EventEmitter();
  usuario!: Usuario;
  form!: FormGroup;
  visible : boolean = true;
  changeType: boolean = true;
  emailInvalido: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicio: UserService,
    private spinner: NgxSpinnerService,
    private router: Router,
    ) {
    this.form = this.formBuilder.group({
      nombre: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z ]{2,254}')],
      ],
      apellido: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z ]{2,254}')],
      ],
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(5)]],
      contraseniaC: ['', [Validators.required, Validators.minLength(5)]],
    });
  }
  
  ngOnInit(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  validar() {
    if (this.form.value.contrasenia != this.form.value.contraseniaC) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'Las contraseñas no coinciden',
      });
    } else {
      this.agregar();
    }
  }

  agregar() {
    Swal.fire({
      html: this.terminosCondiciones(),
      showCancelButton: true,
      cancelButtonColor: "tomato",
      confirmButtonColor: "#006575",
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`,
      customClass: {
        popup: 'swal2-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const usuario: Usuario = {
          nombre: this.form.get('nombre')?.value,
          apellido: this.form.get('apellido')?.value,
          email: this.form.get('email')?.value,
          contrasenia: this.form.get('contrasenia')?.value,
        };
        this.servicio.PostRegistro(usuario).subscribe((data) => {
          if (data.error) {
            this.spinner.hide();
            this.emailInvalido = true;
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: data.error,
            });
          } else {
            this.spinner.hide();
            this.emailInvalido = false;
            Swal.fire({
              icon: 'success',
              title: 'Perfecto...',
              text: 'Se registró su usuario con éxito',
            }).then(() => { 
              this.router.navigateByUrl("/");
            });
          }
        });
      }
    });
  }

  viewpass(){
    this.visible = !this.visible;
    this.changeType= !this.changeType;
  }

  terminosCondiciones() :string { 
    let intro = `<h4> Términos y condiciones </h4> <p> Bienvenido a <strong> SIBI </strong> proporcionado por <strong>SIBI S.R.L</strong> (la "Compañía", "nosotros" o "nos"). 
    Nos complace ofrecerle acceso al Servicio (como se define más abajo), sujeto a estos términos y condiciones (los "Términos de Servicio") y 
    a la Política de Privacidad correspondiente de <strong>SIBI S.R.L</strong>. 
    Al acceder y utilizar el Servicio, usted expresa su consentimiento, acuerdo y entendimiento de los 
    Términos de Servicio y la Política de Privacidad. 
    Si no está de acuerdo con los Términos de Servicio o la Política de Privacidad, no utilice el Servicio. 
    Si utiliza el servicio está aceptando las modalidades operativas en vigencia descritas más adelante, 
    las declara conocer y aceptar, las que se habiliten en el futuro y en los términos y condiciones que a continuación se detallan:</p>`;

    let operaciones = `<h5> Operaciones habilitadas </h5>
    <p> Las operaciones habilitadas son aquellas que estarán disponibles para los clientes, 
    quienes deberán cumplir los requisitos que se encuentren vigentes en su momento para operar el Servicio. 
    Las mismas podrán ser ampliadas o restringidas por el proveedor, comunicándose previamente con una antelación no menor a 60 días, y 
    comprenden entre otras que se indican a continuación: </p>`;

    let transacciones = `<h5> Transacciones </h5>
    <p> En ningún caso debe entenderse que la solicitud de un producto o servicio implica obligación alguna para el 
    Acceso y uso del Servicio. Para operar el Servicio se requerirá siempre que se trate de clientes de <strong>SIBI S.R.L</strong>. 
    Podrán acceder mediante cualquier dispositivo con conexión a la Red Internet. El cliente deberá proporcionar el usuario y clave personal (contraseña), 
    que será provista por la aplicación como requisito previo a la primera operación, en la forma que le sea requerida. La clave personal y 
    todo o cualquier otro mecanismo adicional de autenticación personal provisto por la biblioteca tiene el carácter de secreto e intransferible, y 
    por lo tanto asumo las consecuencias de su divulgación a terceros, liberando a <strong>SIBI S.R.L</strong> de toda responsabilidad que de ello se derive. 
    En ningún caso <strong>SIBI S.R.L</strong> requerirá 
    que le suministre la totalidad de los datos, ni enviará mail requiriendo información personal alguna.</p>`;

    let costo = `<h5> Costo del Servicio </h5>
    <p> La empresa <strong> SIBI S.R.L </strong> no cobrará comisiones por el mantenimiento y/o uso de este Servicio o los que en el futuro implemente. 
    En caso de cualquier modificación a la presente previsión, lo comunicará con al menos 60 días de antelación. </p>`;

    let propiedadIntelectual = `<h5> Propiedad intelectual </h5>
    <p> El software en Argentina está protegido por la ley 11.723, que regula la propiedad intelectual y  
    los derechos de autor de todos aquellos creadores de obras artísticas, literarias y científicas. </p>`;

    let privacidad = `<h5> Privacidad de la información </h5>
    <p> Para utilizar los Servicios ofrecidos por <strong> SIBI S.R.L </strong>, los Usuarios deberán facilitar 
    determinados datos de carácter personal. Su información personal se procesa y almacena en servidores o medios magnéticos 
    que mantienen altos estándares de seguridad y protección tanto física como tecnológica. Para mayor información sobre la privacidad de los Datos 
    Personales y casos en los que será revelada la información personal, se pueden consultar nuestras políticas de privacidad. </p>`;

    return `<div class="sweetalert-terms-content">` +
      intro +
      operaciones +
      transacciones +
      costo +
      propiedadIntelectual +
      privacidad +
      `</div>`;
}
}
