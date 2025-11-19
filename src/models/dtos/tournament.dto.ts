import {
  CreatedTournamentDTOType,
  FindTournamentByIdDTOType,
  TournamentAdministratorDTOType,
  TournamentDriverDTOType,
} from "../../types/dto.types";
import { TournamentType } from "../../types/tournament/tournament.type";
import { UserType } from "../../types/user/user.type";

export class CreatedTournamentDTO {
  static toJSON(tournament: TournamentType): CreatedTournamentDTOType {
    return {
      _id: tournament._id,
      title: tournament.title,
      description: tournament.description,
      banner: tournament.banner,
      rules: tournament.rules,
      adms: tournament.adms,
      createdAt: tournament.createdAt,
    };
  }
}

export class FindTournamentByIdDTO {
  static toJSON(tournament: TournamentType): FindTournamentByIdDTOType {
    return {
      _id: tournament._id,
      title: tournament.title,
      description: tournament.description,
      banner: tournament.banner,
      rules: tournament.rules,
      adms: tournament.adms,
      isFinished: tournament.isFinished,
      drivers: tournament.drivers,
      races: tournament.races,
      createdAt: tournament.createdAt,
    };
  }
}

export class TournamentAdministratorDTO {
  static toJSON(
    tournament: TournamentType,
    user: UserType
  ): TournamentAdministratorDTOType {
    return {
      user: {
        _id: user._id,
        isAdmOf: user.isDriverOf,
        updatedAt: user.updatedAt,
      },
      tournament: {
        _id: tournament._id,
        updatedAt: tournament.updatedAt,
      },
    };
  }
}

export class TournamentDriverDTO {
  static toJSON(
    tournament: TournamentType,
    user: UserType
  ): TournamentDriverDTOType {
    return {
      user: {
        _id: user._id,
        isDriverOf: user.isDriverOf,
        updatedAt: user.updatedAt,
      },
      tournament: {
        _id: tournament._id,
        updatedAt: tournament.updatedAt,
      },
    };
  }
}
