import axiosInstance from './axios';

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  province_id: number;
  name: string;
  type: string;
  postal_code: string;
}

export interface District {
  id: number;
  city_id: number;
  name: string;
}

// Response structure based on Go backend
export interface LocationData {
  provinces: Province[];
  cities: City[];
  districts: District[];
  loaded_at: string;
}

// API Response wrapper structure
export interface ApiResponse<T> {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: T;
}

export class RajaOngkirService {
  /**
   * Get all provinces
   */
  static async getProvinces(): Promise<Province[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Province[]>>('/v1/rajaongkir/provinces');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get provinces error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch provinces. Please try again.');
      }
    }
  }

  /**
   * Get cities by province ID
   */
  static async getCities(provinceId: number): Promise<City[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<City[]>>(`/v1/rajaongkir/cities/${provinceId}`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get cities error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch cities. Please try again.');
      }
    }
  }

  /**
   * Get districts by city ID
   */
  static async getDistricts(cityId: number): Promise<District[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<District[]>>(`/v1/rajaongkir/districts/${cityId}`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get districts error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch districts. Please try again.');
      }
    }
  }
}

export default RajaOngkirService;