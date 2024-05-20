import { AddressApiService } from './../../../features/customers/services/addressApi.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { CreateAddressRequest } from '../../../features/customers/models/address/requests/create-address-request';
import { setAddress } from '../../stores/addresses/address.action';
import { NoStringInputDirective } from '../../../core/directives/no-string-input.directive';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { selectAddress } from '../../stores/addresses/address.selector';

@Component({
  selector: 'app-customer-adress-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NoStringInputDirective],
  templateUrl: './customer-adress-modal.component.html',
  styleUrls: ['./customer-adress-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerAdressModalComponent implements OnInit {
  @ViewChild('customerAddressModal') modalElement!: ElementRef;

  addressForm!: FormGroup;
  isFormValid: boolean = false;
  cities: any = [];
  districts: any = [];
  @Output() cityList = new EventEmitter<any>();
  @Output() districtList = new EventEmitter<any>();
  filteredDistricts: any[] = [];
  isEditMode: boolean = false;

  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private router: Router,
    private addressApiService: AddressApiService,
    private store: Store<{ address: CreateAddressRequest }>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadCitiesOnOpenModal();

    this.store.pipe(select(selectAddress)).subscribe((address) => {
      if (address) {
        this.addressForm.patchValue(address);
      }
      console.log('addressState: ', address);
    });

    this.addressForm.statusChanges.subscribe((status) => {
      this.isFormValid = status === 'VALID';
      console.log(status);
    });
  }
  ngAfterViewInit(): void {
    // Native DOM event listener for modal hidden event
    this.modalElement.nativeElement.addEventListener('hidden.bs.modal', this.handleModalClose.bind(this));
  }

  ngOnDestroy(): void {
    // Cleanup listener to avoid memory leaks
    this.modalElement.nativeElement.removeEventListener('hidden.bs.modal', this.handleModalClose.bind(this));
  }
  handleModalClose(): void {
    // Modal is closed, disable form fields
    this.addressForm.enable();
    console.log('Modal closed, form fields disabled.');
  }
  createForm() {
    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      district: [{ value: '', disabled: true }, Validators.required],
      flatNumber: [null, Validators.required],
      description: ['', Validators.required],
    });
  }
  populateForm(address: CreateAddressRequest) {
    this.isEditMode = true;
    const district = this.districts.find(d => d.id === address.districtId);
    const cityId = district ? district.cityId : null;
    const city = this.cities.find(c => c.id === cityId);

    if (city) {
      this.addressForm.patchValue({
        city: city.id,
        street: address.street,
        district: address.districtId,
        flatNumber: address.flatNumber,
        description: address.description
      });

      this.filteredDistricts = this.districts.filter(d => d.cityId === city.id);
      this.addressForm.get('district')?.enable();
      this.addressForm.get('city')?.disable();
      this.addressForm.get('district')?.disable();
    }
  }
  loadCitiesOnOpenModal() {
    this.addressApiService.getCities().subscribe((citiesData) => {
      this.cities = citiesData;
      this.districts = [];
      if (citiesData) {
        this.addressApiService.getDistricts().subscribe((districtsData) => {
          this.districts = districtsData;
          this.districtList.emit(this.districts);
          this.cdr.detectChanges();
          console.log(districtsData);
        });
        this.cityList.emit(this.cities);
        console.log("cityList", this.cityList)
      }
    });
  }

  createAddress() {
    const newAddress: CreateAddressRequest = {
      street: this.addressForm.value.street,
      districtId: this.addressForm.value.district,
      flatNumber: this.addressForm.value.flatNumber,
      description: this.addressForm.value.description,
      defaultAddress: false,
      customerId: '',
    };

    this.store.dispatch(setAddress({ address: newAddress }));
    console.log(newAddress);
  }

  onCityChange(cityId: any) {
    this.addressForm.get('district').reset({ value: '', disabled: true });
    if (cityId) {
      this.addressForm.get('district').enable();
      this.filteredDistricts = this.districts.filter(
        (district) => district.cityId === cityId
      );
    } else {
      this.addressForm.get('district').disable();
    }
  }

  onSubmit() {
    if (this.addressForm.valid) {
      console.log('Form Created on Modal', this.addressForm.value);
      this.createAddress();
      this.router.navigate(['/create-customer/address-info']);
    }
  }

  onCancel() {
    this.isEditMode = false;
    this.addressForm.reset({
      city: '',
      street: '',
      district: { value: '', disabled: true },
      flatNumber: null,
      description: '',
    });
    this.addressForm.get('district')?.disable();
    this.addressForm.get('city')?.enable();
    this.cdr.detectChanges();
  }
}
