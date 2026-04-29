export interface SupplierProps {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity — Supplier
 *
 * Represents an external vendor that provides products to the warehouse.
 */
export class Supplier {
  private readonly _id: string;
  private _name: string;
  private _contactEmail: string;
  private _contactPhone: string;
  private _address: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: SupplierProps) {
    this.validateName(props.name);
    this.validateEmail(props.contactEmail);
    this._id = props.id;
    this._name = props.name.trim();
    this._contactEmail = props.contactEmail.toLowerCase().trim();
    this._contactPhone = props.contactPhone.trim();
    this._address = props.address.trim();
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: SupplierProps): Supplier {
    return new Supplier(props);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get contactEmail(): string {
    return this._contactEmail;
  }

  get contactPhone(): string {
    return this._contactPhone;
  }

  get address(): string {
    return this._address;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateContactInfo(email: string, phone: string, address: string): void {
    this.validateEmail(email);
    this._contactEmail = email.toLowerCase().trim();
    this._contactPhone = phone.trim();
    this._address = address.trim();
    this._updatedAt = new Date();
  }

  updateName(name: string): void {
    this.validateName(name);
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Supplier name must be at least 2 characters long');
    }
  }

  private validateEmail(email: string): void {
    if (!Supplier.EMAIL_PATTERN.test(email)) {
      throw new Error(`Invalid supplier contact email: "${email}"`);
    }
  }
}
